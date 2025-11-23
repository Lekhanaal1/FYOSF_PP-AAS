# STRIDE Threat Model for AgeToken System

## Legend
**STRIDE** = **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege.

## Threat Matrix

| Threat (STRIDE) | Attack Scenario | Impact | Specific Mitigations for AgeToken Design |
|----------------|----------------|--------|------------------------------------------|
| **S – Spoofing identity** | Attacker forges AgeToken (pretends to be attestor) | Platforms mis-classify adults as minors or vice versa; safety defaults bypassed or abused | • Strong attestor PKI: root CA issues attestor certs<br>• Use Ed25519 or P-256 signatures<br>• Private keys in HSM/KMS only; no plaintext private keys on disk<br>• Attestor cert revocation (CRL/OCSP) and short token TTL |
| **T – Tampering** | Token payload altered in transit (age_band changed) | Safety defaults circumvented | • Tokens are signed; signature verification rejects tampered tokens<br>• Use canonical serialization (e.g., CBOR or canonical JSON) before signing<br>• Audience & nonce binding |
| **R – Repudiation** | Attestor denies issuing token or disputes issuance | Dispute over attestation issuance; auditability affected | • Attestors must log issuance events (append-only logs)<br>• Sign logs (or log-hashes) and keep hashed audit trail<br>• Use non-repudiation via signature timestamps; auditors hold attestor certs |
| **I – Information disclosure** | PII leaked from attestor (student lists, IDs) or token used for linking/profiling | Privacy breach, surveillance risk, chilling effects | • Minimal token: no PII<br>• Attestor must delete PII within 24 hours (policy + enforcement)<br>• Tokens audience-bound and short-lived to prevent linking<br>• Differential privacy + secure enclaves for audits; no raw child-level telemetry leaves platforms |
| **D – Denial of service** | Flood attestor or validation service with token requests; madcow nonce floods | Attestation/validation services unavailable; users cannot get tokens | • Rate limiting & quotas on attestor endpoints<br>• Circuit breakers on validation calls<br>• Platforms do offline validation (no attestor call required) using public attestor keys → reduces runtime dependency on attestor availability |
| **E – Elevation of privilege** | Malicious actor reuses token or uses token to access privileged APIs (e.g., admin) | Unauthorized access or unintended operations | • Tokens are single-purpose (age flag only) and MUST NOT be accepted for auth to other services<br>• Audience field restricts token to a single platform<br>• Platforms treat token as only a safety signal, not an auth credential |

## Operational Mitigations (Cross-Cutting)

### Attestor Certification & Vetting
- Background checks + training required
- Legal agreements to delete PII within 24 hours
- Implementation conformance tests

### Continuous Monitoring & Anomaly Detection
- Alert on issuance rate spikes
- Unusual geographic patterns from an attestor
- Anomalous attestor behavior triggers audits and revocation

### Revocation & Emergency Rotation
- Playbooks for compromised attestors
- Key rotation procedures
- CRL/OCSP endpoints for real-time revocation checks

### Legal & Policy Controls
- Mandatory deletion windows (24 hours)
- Penalties for misuse
- Restricted legal access to raw attestor logs (warrant/process required)

### Transparency
- Public attestor registry
- Issuance statistics (aggregated, differentially private)
- Third-party audits

## Implementation Notes

### Cryptographic Standards
- **Signing Algorithm**: Ed25519 (preferred) or ECDSA P-256
- **Key Management**: FIPS-compliant HSM or cloud KMS with hardware-backed keys
- **Key Rotation**: Regular attestor key updates with certificate chain validation

### Token Properties
- **TTL**: Short-lived (minutes to hours, not days)
- **Nonce**: Random nonce per token to prevent replay
- **Audience Binding**: Single platform per token
- **No PII**: Zero personal information in token payload

### Validation Architecture
- **Offline Validation**: Platforms cache public keys and validate locally
- **Nonce Cache**: Short-lived Redis cache keyed by `tid` or `nonce` with TTL = token lifetime
- **Circuit Breakers**: Prevent cascading failures during attestor outages

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Classification**: Public Technical Specification

