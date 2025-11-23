'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ChevronRight, ChevronLeft } from 'lucide-react';

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', fields: ['title', 'executiveSummary', 'background', 'evidence', 'problemStatement'] },
  { id: 'core', label: 'Core Components', fields: ['ageTokens', 'dutyOfCare', 'stateModules'] },
  { id: 'design', label: 'Design & Security', fields: ['privacyImplementation', 'antiFalseSecurity', 'equityArchitecture', 'securityModel'] },
  { id: 'governance', label: 'Governance & Metrics', fields: ['governance', 'kpis'] },
];

export default function NewReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    executiveSummary: '',
    background: '',
    evidence: '',
    problemStatement: '',
    ageTokens: '',
    dutyOfCare: '',
    stateModules: '',
    privacyImplementation: '',
    antiFalseSecurity: '',
    equityArchitecture: '',
    securityModel: '',
    governance: '',
    kpis: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create report');
        return;
      }

      router.push(`/dashboard/reports/${data.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      title: 'Report Title',
      executiveSummary: 'Executive Summary',
      background: 'Background & Context',
      evidence: 'Evidence & Research',
      problemStatement: 'Problem Statement',
      ageTokens: 'AgeTokens System',
      dutyOfCare: 'Federal Baseline Duty-of-Care',
      stateModules: 'Interoperable State Modules',
      privacyImplementation: 'Privacy-Preserving Implementation',
      antiFalseSecurity: 'Anti-False-Security Design',
      equityArchitecture: 'Equity-Driven Architecture',
      securityModel: 'Security Model (STRIDE)',
      governance: 'Governance (NIST + FTC + NTIA)',
      kpis: 'Key Metrics & Evaluation (KPIs)',
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field: string): string => {
    const placeholders: Record<string, string> = {
      title: 'Enter report title (e.g., PP-AAS: Privacy-Preserving Age Attestation System)',
      executiveSummary: 'Provide a comprehensive executive summary of the proposal...',
      background: 'Describe the background, existing laws (COPPA, CIPA), and current gaps...',
      evidence: 'Include research evidence, COSI data, RFI findings, and supporting data...',
      problemStatement: 'Describe the problem: narrow existing laws, divergent state mandates, privacy risks...',
      ageTokens: 'Detail the AgeToken system: token-based attestation, certified attestors, short-lived tokens, cryptographic properties...',
      dutyOfCare: 'Explain federal baseline duty-of-care: safety defaults, no algorithmic amplification, messaging limits, default private accounts...',
      stateModules: 'Describe interoperable state modules: federal floor, state registration, NTIA registry, preemption of biometric/ID mandates...',
      privacyImplementation: 'Detail privacy-preserving implementation: ephemeral tokens, zero PII retention, attestor deletion requirements, multiple access points...',
      antiFalseSecurity: 'Explain anti-false-security design: mandatory defaults without tokens, Safety Report Cards, public dashboards, risk reduction metrics...',
      equityArchitecture: 'Describe equity-driven architecture: no ID requirement, anonymous attestation, safe-harbor pathways, zero-cost access...',
      securityModel: 'Detail STRIDE threat model: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege mitigations...',
      governance: 'Explain governance structure: NIST (standards), FTC (enforcement), NTIA (coordination), grant programs...',
      kpis: 'Define key metrics: exposure reduction, unsolicited adult contact rate, grooming incidents, engagement harm index, equitable token access...',
    };
    return placeholders[field] || `Enter ${getFieldLabel(field).toLowerCase()}...`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentFields = SECTIONS[currentSection].fields;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create PP-AAS Report</h1>
          <p className="text-gray-600 mt-2">Privacy-Preserving Age Attestation System Framework</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {SECTIONS.map((section, idx) => (
              <div key={section.id} className="flex items-center flex-1">
                <div
                  className={`flex-1 h-2 rounded ${
                    idx <= currentSection ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
                {idx < SECTIONS.length - 1 && (
                  <div className={`w-2 h-2 rounded-full mx-1 ${
                    idx < currentSection ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Section {currentSection + 1} of {SECTIONS.length}: {SECTIONS[currentSection].label}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 lg:p-8">
          <div className="space-y-6">
            {currentFields.map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {getFieldLabel(field)}
                  {['title', 'executiveSummary', 'background', 'evidence'].includes(field) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {field === 'title' ? (
                  <input
                    id={field}
                    name={field}
                    type="text"
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    required={['title', 'executiveSummary', 'background', 'evidence'].includes(field)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder={getFieldPlaceholder(field)}
                  />
                ) : (
                  <textarea
                    id={field}
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    required={['title', 'executiveSummary', 'background', 'evidence'].includes(field)}
                    rows={field === 'title' ? 1 : 8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder={getFieldPlaceholder(field)}
                  />
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {(formData[field as keyof typeof formData] as string).length}/10000 characters
                </p>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex items-center gap-2 px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Cancel
              </Link>
              {currentSection === SECTIONS.length - 1 ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Report'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextSection}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
