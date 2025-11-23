# MIT Policy Hackathon 2025 - Technical Appendix Index

This appendix provides comprehensive technical documentation for the Privacy-Preserving Age Attestation System (PP-AAS) proposal.

## Contents

### 1. Threat Model
**File**: `STRIDE_THREAT_MODEL.md`

Complete STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) threat analysis with specific mitigations for the AgeToken design.

**Key Sections**:
- Threat matrix with attack scenarios and impacts
- Specific mitigations for each threat category
- Operational mitigations (cross-cutting)
- Implementation notes

### 2. Technical Specification
**File**: `TECHNICAL_APPENDIX.md`

Comprehensive technical documentation including:
- Canonical AgeToken JSON specification
- Signature format and cryptographic standards
- Sample code (Node.js attestor, Python validator)
- Operational and security notes
- Test plan and privacy guarantees

### 3. OpenAPI Specification
**File**: `openapi.yaml`

Complete OpenAPI 3.0.3 specification for:
- Token issuance endpoint (`POST /issue_token`)
- Attestor status endpoint (`GET /attestors/{id}/status`)
- Public key bundle endpoint (`GET /validate_pubkeys`)

### 4. Sample Code
**Directory**: `../samples/`

Proof-of-concept implementations:
- **Node.js Attestor** (`attestor-node/`): Express server for token issuance
- **Python Validator** (`validator-python/`): Flask server for token validation

Both include:
- Working code with dependencies
- README with quick start instructions
- Production requirements checklist

## Quick Reference

### AgeToken Structure
```json
{
  "tid": "uuid-v4",
  "att": "attestor-id",
  "age": "13_15",
  "aud": "com.example.app",
  "iat": 1700000000,
  "exp": 1700003600,
  "nonce": "base64-random",
  "flags": { "purpose": "safety" }
}
```

### Key Security Properties
- **No PII**: Zero personal information in token
- **Short TTL**: Minutes to hours, not days
- **Audience Bound**: Single platform per token
- **Cryptographically Signed**: Ed25519 or P-256
- **Replay Prevention**: Nonce + short-term cache

### Cryptographic Standards
- **Signing**: Ed25519 (preferred) or ECDSA P-256
- **Key Management**: FIPS-compliant HSM or cloud KMS
- **Key Format**: Base64 encoded public keys
- **Token Format**: `<base64url(payload)>.<base64url(signature)>`

## Running the PoC

1. **Start Attestor**:
   ```bash
   cd samples/attestor-node
   npm install && npm start
   ```

2. **Start Validator**:
   ```bash
   cd samples/validator-python
   pip install -r requirements.txt
   python validator.py
   ```

3. **Test Flow**:
   - Get public key from attestor
   - Set public key in validator
   - Issue token from attestor
   - Validate token in validator

See `samples/README.md` for detailed instructions.

## Privacy Guarantees

1. **No PII in tokens**: Only age bucket, no personal information
2. **Attestor PII deletion**: Mandatory within 24 hours
3. **Differential Privacy for KPIs**: All audit data uses DP mechanisms
4. **Short token TTL**: Prevents long-term tracking
5. **Audience binding**: Prevents cross-platform linking
6. **Nonce-based replay prevention**: Prevents token reuse

## Operational Requirements

### Attestor Requirements
- HSM/KMS for private key storage
- mTLS authentication
- Rate limiting and quotas
- Append-only logging
- Anomaly detection
- Certificate revocation support (CRL/OCSP)

### Platform Requirements
- Public key bundle caching
- Offline token validation
- Nonce cache for replay prevention
- Circuit breakers for resilience
- Certificate chain validation

## Test Plan

### Unit Tests
- Token issuance with valid/invalid inputs
- Signature generation and verification
- Expiration handling
- Audience validation

### Integration Tests
- End-to-end token flow (issue → validate)
- Replay prevention
- Rate limiting
- Error handling

### Security Tests
- Tampered token detection
- Expired token rejection
- Audience mismatch detection
- Signature verification failure

## Supporting Documentation

- **STRIDE Threat Model**: Complete threat analysis
- **Technical Appendix**: Implementation details
- **OpenAPI Spec**: API contract
- **Sample Code**: Working PoC implementations

## Contact & References

For questions or clarifications on the technical implementation, refer to:
- Technical Appendix: `TECHNICAL_APPENDIX.md`
- STRIDE Threat Model: `STRIDE_THREAT_MODEL.md`
- OpenAPI Specification: `openapi.yaml`

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Classification**: Public Technical Documentation

