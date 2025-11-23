'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const STRIDE_THREATS = [
  {
    id: 'S',
    name: 'Spoofing identity',
    attack: 'Attacker forges AgeToken (pretends to be attestor)',
    impact: 'Platforms mis-classify adults as minors or vice versa; safety defaults bypassed or abused',
    mitigations: [
      'Strong attestor PKI: root CA issues attestor certs',
      'Use Ed25519 or P-256 signatures',
      'Private keys in HSM/KMS only; no plaintext private keys on disk',
      'Attestor cert revocation (CRL/OCSP) and short token TTL',
    ],
  },
  {
    id: 'T',
    name: 'Tampering',
    attack: 'Token payload altered in transit (age_band changed)',
    impact: 'Safety defaults circumvented',
    mitigations: [
      'Tokens are signed; signature verification rejects tampered tokens',
      'Use canonical serialization (e.g., CBOR or canonical JSON) before signing',
      'Audience & nonce binding',
    ],
  },
  {
    id: 'R',
    name: 'Repudiation',
    attack: 'Attestor denies issuing token or disputes issuance',
    impact: 'Dispute over attestation issuance; auditability affected',
    mitigations: [
      'Attestors must log issuance events (append-only logs)',
      'Sign logs (or log-hashes) and keep hashed audit trail',
      'Use non-repudiation via signature timestamps; auditors hold attestor certs',
    ],
  },
  {
    id: 'I',
    name: 'Information disclosure',
    attack: 'PII leaked from attestor (student lists, IDs) or token used for linking/profiling',
    impact: 'Privacy breach, surveillance risk, chilling effects',
    mitigations: [
      'Minimal token: no PII',
      'Attestor must delete PII within 24 hours (policy + enforcement)',
      'Tokens audience-bound and short-lived to prevent linking',
      'Differential privacy + secure enclaves for audits; no raw child-level telemetry leaves platforms',
    ],
  },
  {
    id: 'D',
    name: 'Denial of service',
    attack: 'Flood attestor or validation service with token requests; madcow nonce floods',
    impact: 'Attestation/validation services unavailable; users cannot get tokens',
    mitigations: [
      'Rate limiting & quotas on attestor endpoints',
      'Circuit breakers on validation calls',
      'Platforms do offline validation (no attestor call required) using public attestor keys → reduces runtime dependency on attestor availability',
    ],
  },
  {
    id: 'E',
    name: 'Elevation of privilege',
    attack: 'Malicious actor reuses token or uses token to access privileged APIs (e.g., admin)',
    impact: 'Unauthorized access or unintended operations',
    mitigations: [
      'Tokens are single-purpose (age flag only) and MUST NOT be accepted for auth to other services',
      'Audience field restricts token to a single platform',
      'Platforms treat token as only a safety signal, not an auth credential',
    ],
  },
];

const OPERATIONAL_MITIGATIONS = [
  'Attestor certification & vetting (background checks + training)',
  'Continuous monitoring & anomaly detection on issuance rates (alert on spikes)',
  'Revocation & emergency rotation playbooks for compromised attestors',
  'Legal & policy controls: mandatory deletion windows; penalties for misuse; restricted legal access to raw attestor logs (warrant/process required)',
  'Transparency: public attestor registry, issuance statistics, and third-party audits',
];

export default function ThreatModelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">STRIDE Threat Model</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Complete threat analysis with specific mitigations tailored to the AgeToken design
          </p>
        </div>

        {/* Legend */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p className="text-sm text-blue-800">
            <strong>STRIDE</strong> = <strong>S</strong>poofing, <strong>T</strong>ampering,{' '}
            <strong>R</strong>epudiation, <strong>I</strong>nformation disclosure,{' '}
            <strong>D</strong>enial of service, <strong>E</strong>levation of privilege
          </p>
        </div>

        {/* Threat Matrix */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threat (STRIDE)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attack Scenario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key Mitigations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {STRIDE_THREATS.map((threat) => (
                  <tr
                    key={threat.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold mr-2">
                          {threat.id}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{threat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{threat.attack}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{threat.impact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {threat.mitigations.slice(0, 2).map((m, idx) => (
                          <div key={idx} className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{m}</span>
                          </div>
                        ))}
                        {threat.mitigations.length > 2 && (
                          <span className="text-blue-600 text-xs">
                            +{threat.mitigations.length - 2} more mitigations
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View */}
        {selectedThreat && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {STRIDE_THREATS.find(t => t.id === selectedThreat)?.name} - Detailed Mitigations
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Attack Scenario</h3>
                <p className="text-sm text-gray-600">
                  {STRIDE_THREATS.find(t => t.id === selectedThreat)?.attack}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Impact</h3>
                <p className="text-sm text-gray-600">
                  {STRIDE_THREATS.find(t => t.id === selectedThreat)?.impact}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Specific Mitigations</h3>
                <ul className="space-y-2">
                  {STRIDE_THREATS.find(t => t.id === selectedThreat)?.mitigations.map((mitigation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{mitigation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Operational Mitigations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Operational Mitigations (Cross-Cutting)</h2>
          <ul className="space-y-3">
            {OPERATIONAL_MITIGATIONS.map((mitigation, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>{mitigation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reference Link */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            For complete technical documentation, see:{' '}
            <Link href="/docs/STRIDE_THREAT_MODEL.md" className="text-blue-600 hover:underline">
              docs/STRIDE_THREAT_MODEL.md
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

