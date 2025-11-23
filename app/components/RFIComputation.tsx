'use client';

import { useState, useEffect } from 'react';
import { Calculator, Loader2, CheckCircle, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

interface PolicyDataFile {
  id: string;
  fileName: string;
  fileType: string;
  country: string | null;
  state: string | null;
  createdAt: string;
}

interface RFIResult {
  rfi: {
    year: number;
    RFI: number;
    H: number;
    H_max: number;
    SAS: Record<string, number>;
    adoptionMatrix: Record<string, Record<string, number>>;
    p_j: Record<string, number>;
  };
  timeseries: Array<{ year: number; RFI: number; H: number; H_max: number }>;
  stats: {
    totalStates: number;
    totalElements: number;
    totalPolicies: number;
    dataSources: string[];
  };
}

export default function RFIComputation({ reportId }: { reportId?: string }) {
  const [policyFiles, setPolicyFiles] = useState<PolicyDataFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [computing, setComputing] = useState(false);
  const [rfiResult, setRfiResult] = useState<RFIResult | null>(null);
  const [error, setError] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    fetchPolicyFiles();
  }, []);

  const fetchPolicyFiles = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setPolicyFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch policy files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleComputeRFI = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one policy data file');
      return;
    }

    setComputing(true);
    setError('');
    setRfiResult(null);

    try {
      const response = await fetch('/api/rfi/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyDataIds: selectedFiles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to compute RFI');
        return;
      }

      setRfiResult(data);

      // If reportId is provided, save FragmentationAnalysis
      if (reportId && data.rfi) {
        await saveFragmentationAnalysis(reportId, data);
      }
    } catch (err) {
      setError('An error occurred while computing RFI');
      console.error(err);
    } finally {
      setComputing(false);
    }
  };

  const saveFragmentationAnalysis = async (reportId: string, result: RFIResult) => {
    try {
      await fetch(`/api/reports/${reportId}/fragmentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragmentationScore: result.rfi.RFI,
          countryCount: 1, // Assuming US only for now
          stateCount: result.stats.totalStates,
          policyCount: result.stats.totalPolicies,
          dataSources: result.stats.dataSources,
          analysisData: JSON.stringify({
            SAS: result.rfi.SAS,
            p_j: result.rfi.p_j,
            timeseries: result.timeseries,
          }),
        }),
      });
    } catch (err) {
      console.error('Failed to save fragmentation analysis:', err);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (loadingFiles) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading policy files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Compute RFI from Policy Data</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Select policy data files to compute the Regulatory Fragmentation Index (RFI) using Shannon entropy.
          RFI measures how fragmented state regulations are (0 = uniform, 1 = highly fragmented).
        </p>

        {policyFiles.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              No policy data files found. Upload files in{' '}
              <a href="/dashboard/data" className="underline font-medium">Policy Data Navigation</a> first.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Policy Data Files ({selectedFiles.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                {policyFiles.map((file) => (
                  <label
                    key={file.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {file.state && `${file.state} • `}
                        {file.fileType} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleComputeRFI}
              disabled={computing || selectedFiles.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {computing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Computing RFI...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Compute RFI
                </>
              )}
            </button>
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {rfiResult && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">RFI Computation Results</h3>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-700">RFI Score</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {(rfiResult.rfi.RFI * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {rfiResult.rfi.RFI < 0.3 ? 'Low fragmentation' : 
                 rfiResult.rfi.RFI < 0.7 ? 'Moderate fragmentation' : 
                 'High fragmentation'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-700">States</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {rfiResult.stats.totalStates}
              </p>
              <p className="text-xs text-gray-500 mt-1">Analyzed</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-700">Policy Elements</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {rfiResult.stats.totalElements}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tracked</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-medium text-gray-700">Policies</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {rfiResult.stats.totalPolicies}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total records</p>
            </div>
          </div>

          {/* State Alignment Scores (Top 10) */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">State Alignment Scores (Top 10)</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">State</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">SAS</th>
                      <th className="px-4 py-2 w-32"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(rfiResult.rfi.SAS)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([state, score]) => (
                        <tr key={state}>
                          <td className="px-4 py-2 font-medium text-gray-900">{state}</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            {(score * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${score * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RFI Timeseries */}
          {rfiResult.timeseries.length > 1 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">RFI Over Time</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  {rfiResult.timeseries.map((point) => (
                    <div key={point.year} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-medium text-gray-700">{point.year}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${point.RFI * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-right text-gray-600">
                        {(point.RFI * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

