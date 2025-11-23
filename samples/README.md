# AgeToken Sample Code

This directory contains proof-of-concept implementations for the AgeToken system.

## Directory Structure

- `attestor-node/` - Node.js/Express attestor implementation
- `validator-python/` - Python/Flask token validator

## Quick Start

### 1. Node.js Attestor

```bash
cd attestor-node
npm install
node attestor.js
```

The attestor will:
- Generate a keypair (demo only - use HSM in production)
- Display the public key (share with validator)
- Listen on port 3000

**Test issuance:**
```bash
curl -X POST http://localhost:3000/issue_token \
  -H "Content-Type: application/json" \
  -d '{"age":"13_15","aud":"com.example.app","nonce":"test123"}'
```

**Get public key:**
```bash
curl http://localhost:3000/public_key
```

### 2. Python Validator

```bash
cd validator-python
pip install -r requirements.txt
python validator.py
```

The validator will listen on port 5001.

**Set public key (from attestor):**
```bash
curl -X POST http://localhost:5001/set_public_key \
  -H "Content-Type: application/json" \
  -d '{"pubkey": "<base64_public_key_from_attestor>"}'
```

**Validate token:**
```bash
curl -X POST http://localhost:5001/validate_token \
  -H "Content-Type: application/json" \
  -d '{"token": "<token_from_attestor>", "aud": "com.example.app"}'
```

## Demo Flow

1. Start attestor: `cd attestor-node && npm start`
2. Get public key: `curl http://localhost:3000/public_key`
3. Start validator: `cd validator-python && python validator.py`
4. Set public key in validator (use key from step 2)
5. Issue token from attestor
6. Validate token in validator
7. Platform applies safety rules based on `is_minor` flag

## Production Requirements

These PoC implementations are simplified. For production:

### Attestor
- Use HSM/KMS for key management (AWS CloudHSM, Azure Key Vault)
- Implement mTLS authentication
- Add rate limiting and quotas
- Log all issuance events (append-only)
- Monitor for anomalies
- Implement certificate revocation (CRL/OCSP)

### Validator
- Fetch public key bundles from `/validate_pubkeys` endpoint
- Cache keys and refresh periodically
- Verify certificate chains
- Check CRL/OCSP for revocation
- Implement nonce cache (Redis) for replay prevention
- Add circuit breakers for resilience

## Security Notes

- **Never export private keys** - use HSM/KMS only
- **Use Ed25519 or P-256** for signatures
- **Short token TTL** (minutes to hours, not days)
- **Audience binding** prevents cross-platform reuse
- **Nonce + cache** prevents replay attacks
- **No PII in tokens** - only age bucket

## See Also

- Technical Appendix: `../docs/TECHNICAL_APPENDIX.md`
- STRIDE Threat Model: `../docs/STRIDE_THREAT_MODEL.md`
- OpenAPI Spec: `../docs/openapi.yaml`

