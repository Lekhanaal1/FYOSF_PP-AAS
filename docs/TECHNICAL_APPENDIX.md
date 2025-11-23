# Technical Appendix: AgeToken Specification & Implementation

## A. Canonical AgeToken Spec (JSON)

Minimal, canonical, and unambiguous token structure.

```json
{
  "tid": "uuid-v4",             // token id, random UUID
  "att": "attestor-id",         // attestor identifier (DID or registry id)
  "age": "13_15",               // age bucket: e.g. "UNDER_13","13_15","16_17","18_PLUS"
  "aud": "com.example.app",     // audience = platform identifier (domain or client id)
  "iat": 1700000000,            // issued-at (unix epoch)
  "exp": 1700003600,            // expires-at (unix epoch) short TTL (minutes–hours)
  "nonce": "base64-random",     // random nonce to help prevent replay
  "flags": { "purpose": "safety" } // optional, extendable field
}
```

### Signature Format

Sign the canonical serialized form (e.g., compact JSON or CBOR) using Ed25519 or ECDSA P-256. Store signature separately, or use a JOSE/JWT compact form but **do not** include PII in any claim.

**Compact Token Format**: `<base64url(payload)>.<base64url(signature)>`

### Important Properties

- **`aud`** prevents cross-platform reuse
- **`exp`** enforces short life
- **`nonce`** + optional short platform-side cache prevents replay inside TTL
- **No user ID, no IP, no PII** in token

### Age Buckets

- `UNDER_13`: Children under 13 years old
- `13_15`: Ages 13-15 inclusive
- `16_17`: Ages 16-17 inclusive
- `18_PLUS`: Adults 18 and older

---

## B. OpenAPI Specification

See `docs/openapi.yaml` for complete OpenAPI 3.0.3 specification.

### Key Endpoints

1. **POST /issue_token** - Issue AgeToken (attestor)
   - Requires mTLS authentication
   - Input: `age`, `aud`, `nonce`
   - Output: Compact signed token

2. **GET /attestors/{id}/status** - Attestor certificate status
   - Returns: `active`, `revoked`, or `suspended`

3. **GET /validate_pubkeys** - Retrieve attestor public keys bundle
   - For offline validation by platforms
   - Returns: Array of attestor public keys

---

## C. Sample Code: Node.js Attestor (Express)

**File**: `samples/attestor-node/attestor.js`

```javascript
// package.json deps: express, uuid, tweetnacl, base64url
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const nacl = require('tweetnacl'); // Ed25519
const base64url = require('base64url');

const app = express();
app.use(express.json());

// Example: load attestor private key from KMS/HSM in real deployment
// Here we generate a keypair for demo (DO NOT do this in prod)
const keypair = nacl.sign.keyPair();
// privateKey = keypair.secretKey; publicKey = keypair.publicKey;

function signToken(payloadObj, privateKey) {
  const payload = JSON.stringify(payloadObj);
  const sig = nacl.sign.detached(Buffer.from(payload), privateKey);
  return base64url.encode(Buffer.from(payload)) + "." + base64url.encode(Buffer.from(sig));
}

app.post('/issue_token', (req, res) => {
  // Authenticate caller via mTLS (omitted here)
  const { age, aud, nonce } = req.body;
  
  if (!age || !aud || !nonce) {
    return res.status(400).json({error: "missing fields"});
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = 60 * 60; // 1 hour

  const tokenObj = {
    tid: uuidv4(),
    att: "attestor.example.org",
    age: age,
    aud: aud,
    iat: now,
    exp: now + ttl,
    nonce: nonce
  };

  const compact = signToken(tokenObj, keypair.secretKey);
  return res.status(201).json({ token: compact });
});

app.listen(3000, () => console.log('Attestor PoC running on port 3000'));
```

**Production Requirements**:
- Use HSM-managed keys (AWS CloudHSM/AWS KMS, Azure Key Vault)
- Add logging, input validation, rate limits
- Robust error handling
- mTLS authentication

---

## D. Sample Code: Python Token Validator (Flask)

**File**: `samples/validator-python/validator.py`

```python
# pip install flask pynacl base64url
from flask import Flask, request, jsonify
import base64, time, json
import nacl.signing, nacl.encoding
import base64url

app = Flask(__name__)

# Example public key – in production fetch attestor public keys bundle securely
pubkey_b64 = "..."  # base64 public key
public_key = nacl.signing.VerifyKey(base64.b64decode(pubkey_b64))

def validate_compact_token(compact_token, expected_aud):
    try:
        payload_b64, sig_b64 = compact_token.split('.')
        payload_json = base64url.decode(payload_b64)
        sig = base64url.decode(sig_b64)
        
        # verify signature
        public_key.verify(payload_json.encode('utf-8'), sig)
        
        payload = json.loads(payload_json)
        now = int(time.time())
        
        if payload['aud'] != expected_aud:
            return False, "audience mismatch"
        
        if payload['exp'] < now:
            return False, "expired"
        
        # optional: nonce check against short-term cache to prevent replay
        return True, payload
        
    except Exception as e:
        return False, str(e)

@app.route('/validate_token', methods=['POST'])
def validate_token():
    data = request.json
    token = data.get('token')
    appid = data.get('aud')
    
    ok, info = validate_compact_token(token, appid)
    
    if ok:
        return jsonify({"valid": True, "payload": info}), 200
    else:
        return jsonify({"valid": False, "error": info}), 400

if __name__ == '__main__':
    app.run(port=5001)
```

**Production Requirements**:
- Use key rotation, verify attestor cert chain
- Maintain CRL/OCSP checks
- Cache public-key bundles and refresh periodically
- For nonce detection, use short-lived Redis cache keyed by `tid` or `nonce` with TTL = token lifetime

---

## E. Operational & Security Notes

### HSM/KMS
- Store attestor private keys in FIPS-compliant HSM or cloud KMS with hardware-backed keys
- Attestor signing should only be via HSM-backed API
- **Never export private keys**

### PKI
- Root CA (e.g., operated by NIST / delegated) issues attestor certs
- Provide attestor registry API, CRL & OCSP endpoints
- Certificate chain validation required

### Attestor Onboarding
- Background checks required
- Training on privacy and security
- Legal agreements to delete PII within 24 hours
- Implementation conformance tests

### Audits & KPIs
- Platforms submit aggregated KPIs on periodic schedule
- Use Differential Privacy (DP) mechanisms before aggregation (Gaussian/Laplace noise)
- Secure aggregation protocol (MPC or secure enclave) for multi-platform analysis
- Publish Safety Report Cards with DP confidence intervals
- Store raw logs only under strict legal process

### Logging & Monitoring
- Append-only signed logs (e.g., chained log hashes)
- Anomaly detection: issuance rate spikes, unusual geographic patterns from an attestor
- Real-time alerting on suspicious patterns

---

## F. Test Plan

### PoC Testing
1. **Node Attestor**
   - `npm install express uuid tweetnacl base64url`
   - `node attestor.js` (listens on port 3000)
   - `POST /issue_token` with JSON `{ "age":"13_15","aud":"com.example.app","nonce":"r4nd" }`
   - Receive token: `<payload>.<sig>`

2. **Python Validator**
   - `pip install flask pynacl base64url`
   - Set `pubkey_b64` to the attestor public key (from Node PoC)
   - `python validator.py` (listens on 5001)
   - `POST /validate_token` with JSON `{ "token": "<token>", "aud": "com.example.app" }`

3. **Demo Flow**
   - Issue token → validate token → platform toggles `is_minor` flag → apply safety rules

### Integration Testing
- Token issuance with valid/invalid inputs
- Signature verification with valid/tampered tokens
- Expiration handling
- Audience mismatch detection
- Nonce replay prevention
- Rate limiting on attestor endpoints

---

## G. Privacy Guarantee Summary

1. **No PII in tokens**: Tokens contain only age bucket, no personal information
2. **Attestor PII deletion**: Mandatory deletion within 24 hours
3. **Differential Privacy for KPIs**: All audit data uses DP mechanisms
4. **Short token TTL**: Prevents long-term tracking
5. **Audience binding**: Prevents cross-platform linking
6. **Nonce-based replay prevention**: Prevents token reuse

---

## H. Appendix File References

Supporting documentation:
- STRIDE Threat Model: `docs/STRIDE_THREAT_MODEL.md`
- OpenAPI Specification: `docs/openapi.yaml`
- Sample Code: `samples/` directory

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Classification**: Public Technical Specification

