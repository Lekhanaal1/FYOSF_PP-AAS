import Link from 'next/link';
import { Shield, FileText, Users, BarChart3, Key, Lock, Network, TrendingUp, Scale, Eye } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Federal Youth Online Safety Framework
              </h1>
              <p className="text-lg text-gray-600 mt-1">(FYOSF)</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            PP-AAS: Privacy-Preserving Age Attestation System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A federated, privacy-preserving ecosystem combining AgeTokens, federal baseline duty-of-care,
            and interoperable state modules to protect youth online without compromising privacy or equity.
          </p>
        </div>

        {/* Key Differentiators */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Our Unique Differentiators
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AgeTokens System
              </h3>
              <p className="text-gray-600 text-sm">
                Ephemeral, unlinkable, non-replayable cryptographic tokens that prove age-range without sharing PII. Zero PII retention by platforms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Federal Duty-of-Care
              </h3>
              <p className="text-gray-600 text-sm">
                Mandatory safety defaults: no algorithmic amplification of risky content, messaging limits, default private accounts. Differentially-private KPIs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                State Modules
              </h3>
              <p className="text-gray-600 text-sm">
                Federal floor preempts biometric/ID mandates. States register interoperable modules via NTIA registry.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Privacy-Preserving
              </h3>
              <p className="text-gray-600 text-sm">
                Explicitly bans ID/biometrics for platform verification. Attestors delete PII within 24 hours. Multiple equitable access points.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Anti-False-Security
              </h3>
              <p className="text-gray-600 text-sm">
                Mandatory safety defaults even without tokens. Cross-platform Safety Report Cards. Public dashboards showing risk reduction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Equity-Driven
              </h3>
              <p className="text-gray-600 text-sm">
                Requires no ID. Provides anonymous attestation. Safe-harbor pathways for vulnerable youth. Zero-cost access through public institutions.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-4 text-center">
            The Only Federated, Privacy-Preserving Ecosystem
          </h3>
          <p className="text-center text-blue-100 max-w-3xl mx-auto mb-6">
            Nobody else builds a coherent system combining AgeTokens, Federal baseline duty-of-care,
            Interoperable State Modules, and Differentially private regulatory KPIs. Others propose parts. We propose the complete system.
          </p>
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-2">1</div>
              <div className="text-sm">Integration</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-2">2</div>
              <div className="text-sm">Privacy Implementation</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-2">3</div>
              <div className="text-sm">Anti-False-Security</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-2">4</div>
              <div className="text-sm">Equity Architecture</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join us in creating a safer online environment for youth. Register now
            to access the full framework and contribute to this important initiative.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2025 Federal Youth Online Safety Framework. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

