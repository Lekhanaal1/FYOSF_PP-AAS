'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Key, Shield, Network, Lock, Eye, Scale, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Report {
  id: string;
  title: string;
  executiveSummary: string;
  background: string;
  evidence: string;
  problemStatement?: string;
  ageTokens?: string;
  dutyOfCare?: string;
  stateModules?: string;
  privacyImplementation?: string;
  antiFalseSecurity?: string;
  equityArchitecture?: string;
  securityModel?: string;
  governance?: string;
  kpis?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string | null;
    email: string;
  };
}

const SECTION_CONFIG = [
  { key: 'executiveSummary', title: 'Executive Summary', icon: FileText, color: 'blue' },
  { key: 'background', title: 'Background', icon: FileText, color: 'green' },
  { key: 'problemStatement', title: 'Problem Statement', icon: AlertTriangle, color: 'red' },
  { key: 'evidence', title: 'Evidence & Research', icon: BarChart3, color: 'purple' },
  { key: 'ageTokens', title: 'AgeTokens System', icon: Key, color: 'blue' },
  { key: 'dutyOfCare', title: 'Federal Baseline Duty-of-Care', icon: Shield, color: 'green' },
  { key: 'stateModules', title: 'Interoperable State Modules', icon: Network, color: 'purple' },
  { key: 'privacyImplementation', title: 'Privacy-Preserving Implementation', icon: Lock, color: 'orange' },
  { key: 'antiFalseSecurity', title: 'Anti-False-Security Design', icon: Eye, color: 'red' },
  { key: 'equityArchitecture', title: 'Equity-Driven Architecture', icon: Scale, color: 'indigo' },
  { key: 'securityModel', title: 'Security Model (STRIDE)', icon: Shield, color: 'gray' },
  { key: 'governance', title: 'Governance (NIST + FTC + NTIA)', icon: FileText, color: 'blue' },
  { key: 'kpis', title: 'Key Metrics & Evaluation (KPIs)', icon: BarChart3, color: 'green' },
];

export default function ReportDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && params.id) {
      fetchReport();
    }
  }, [status, params.id, router]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
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

  if (!report) {
    return null;
  }

  const renderSection = (config: typeof SECTION_CONFIG[0]) => {
    const content = report[config.key as keyof Report] as string | undefined;
    if (!content || content.trim() === '') return null;

    const Icon = config.icon;
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      gray: 'text-gray-600 bg-gray-100',
    };

    return (
      <section key={config.key} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[config.color as keyof typeof colorClasses]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      </section>
    );
  };

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
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 lg:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
                <div className="flex items-center gap-4 text-blue-100 text-sm">
                  <span>By {report.author.name || report.author.email}</span>
                  <span>•</span>
                  <span>Updated {formatDateTime(report.updatedAt)}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  report.status === 'PUBLISHED'
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {report.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {SECTION_CONFIG.map(renderSection).filter(Boolean)}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Close
              </Link>
              <Link
                href={`/dashboard/reports/${report.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Report</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
