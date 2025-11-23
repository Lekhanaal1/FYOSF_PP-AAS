'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Upload, FileSpreadsheet, FileText, MapPin, Globe, BarChart3, ArrowLeft, Download, Trash2 } from 'lucide-react';

interface PolicyData {
  id: string;
  fileName: string;
  fileType: string;
  country: string | null;
  state: string | null;
  category: string | null;
  createdAt: string;
  uploadedBy: {
    email: string;
  };
}

export default function DataNavigationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<PolicyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFiles();
    }
  }, [status, router]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'EXCEL' : 'CSV';
      let parsedData: any;

      if (fileType === 'EXCEL') {
        // Dynamic import for XLSX (client-side only)
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        // Dynamic import for PapaParse (client-side only)
        const Papa = (await import('papaparse')).default;
        const text = await file.text();
        parsedData = new Promise((resolve) => {
          Papa.parse(text, {
            header: true,
            complete: (results) => resolve(results.data),
          });
        });
        parsedData = await parsedData;
      }

      // Extract metadata (country, state, category) from filename or first row
      const metadata = extractMetadata(file.name, parsedData);

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType,
          country: metadata.country,
          state: metadata.state,
          category: metadata.category,
          rawData: JSON.stringify(parsedData),
        }),
      });

      if (response.ok) {
        await fetchFiles();
        alert('File uploaded successfully!');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const extractMetadata = (fileName: string, data: any[]): { country?: string; state?: string; category?: string } => {
    const metadata: { country?: string; state?: string; category?: string } = {};

    // Try to extract from filename
    const fileNameLower = fileName.toLowerCase();
    const countryMatch = fileNameLower.match(/(usa|united states|canada|uk|australia|germany|france)/);
    if (countryMatch) {
      metadata.country = countryMatch[0];
    }

    // Try to extract from first row of data
    if (data && data.length > 0) {
      const firstRow = data[0];
      if (firstRow.country) metadata.country = firstRow.country;
      if (firstRow.state) metadata.state = firstRow.state;
      if (firstRow.category) metadata.category = firstRow.category;
    }

    return metadata;
  };

  const previewFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/data/${fileId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviewData(JSON.parse(data.rawData));
        setSelectedFile(fileId);
      }
    } catch (error) {
      console.error('Failed to preview file:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/data/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFiles();
        if (selectedFile === fileId) {
          setPreviewData(null);
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const countries = [...new Set(files.map(f => f.country).filter(Boolean))];
  const states = [...new Set(files.map(f => f.state).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Policy Data Navigation System</h1>
          <p className="text-gray-600 mt-2">Navigate fragmented Excel/CSV policy data across countries and states</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Policy Data</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Excel (.xlsx, .xls) or CSV files
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: File List & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Files</span>
                  <span className="font-semibold">{files.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Countries</span>
                  <span className="font-semibold">{countries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">States/Regions</span>
                  <span className="font-semibold">{states.length}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Country
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All Countries</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    State/Region
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All States</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedFile === file.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => previewFile(file.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {file.fileType === 'EXCEL' ? (
                            <FileSpreadsheet className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {file.fileName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          {file.country && <div>Country: {file.country}</div>}
                          {file.state && <div>State: {file.state}</div>}
                          {file.category && <div>Category: {file.category}</div>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Data Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
              {previewData ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 20).map((row: any, idx: number) => (
                        <tr key={idx}>
                          {Object.values(row).map((cell: any, cellIdx: number) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 20 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Showing first 20 rows of {previewData.length} total rows
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Select a file to preview its data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

