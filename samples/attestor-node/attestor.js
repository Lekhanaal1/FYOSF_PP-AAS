/**
 * AgeToken Attestor - Node.js/Express Implementation
 * 
 * This is a minimal PoC. In production, use HSM-managed keys
 * (e.g., AWS CloudHSM/AWS KMS with signing, or Azure Key Vault),
 * add logging, input validation, rate limits, and robust error handling.
 * 
 * Dependencies: express, uuid, tweetnacl, base64url
 */

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

// Store public key for validator (in production, publish via /validate_pubkeys endpoint)
const publicKeyBase64 = Buffer.from(keypair.publicKey).toString('base64');
console.log('Attestor Public Key (base64):', publicKeyBase64);
console.log('Share this with the validator for token verification\n');

/**
 * Sign a token payload with Ed25519 signature
 * @param {Object} payloadObj - Token payload object
 * @param {Uint8Array} privateKey - Attestor private key
 * @returns {string} Compact token format: <base64url(payload)>.<base64url(signature)>
 */
function signToken(payloadObj, privateKey) {
  // Canonical JSON serialization (sorted keys for deterministic output)
  const payload = JSON.stringify(payloadObj, Object.keys(payloadObj).sort());
  const sig = nacl.sign.detached(Buffer.from(payload), privateKey);
  return base64url.encode(Buffer.from(payload)) + "." + base64url.encode(Buffer.from(sig));
}

/**
 * POST /issue_token
 * Issues a new AgeToken
 * 
 * Request body:
 * {
 *   "age": "13_15",           // Age bucket: UNDER_13, 13_15, 16_17, 18_PLUS
 *   "aud": "com.example.app",  // Audience (platform identifier)
 *   "nonce": "random_base64"   // Random nonce for replay prevention
 * }
 */
app.post('/issue_token', (req, res) => {
  // TODO: Authenticate caller via mTLS (omitted here for PoC)
  // In production: verify mTLS client certificate
  
  const { age, aud, nonce } = req.body;
  
  // Validate required fields
  if (!age || !aud || !nonce) {
    return res.status(400).json({ error: "missing fields" });
  }
  
  // Validate age bucket
  const validAgeBuckets = ["UNDER_13", "13_15", "16_17", "18_PLUS"];
  if (!validAgeBuckets.includes(age)) {
    return res.status(400).json({ error: "invalid age bucket" });
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = 60 * 60; // 1 hour TTL

  const tokenObj = {
    tid: uuidv4(),
    att: "attestor.example.org",
    age: age,
    aud: aud,
    iat: now,
    exp: now + ttl,
    nonce: nonce,
    flags: { purpose: "safety" }
  };

  const compact = signToken(tokenObj, keypair.secretKey);
  
  // TODO: Log issuance event (append-only log)
  // TODO: Check rate limits
  // TODO: Monitor for anomalies
  
  return res.status(201).json({ 
    token: compact,
    expires_at: tokenObj.exp
  });
});

/**
 * GET /public_key
 * Returns the attestor public key for token validation
 * In production, this would be part of the /validate_pubkeys bundle
 */
app.get('/public_key', (req, res) => {
  return res.json({
    attestor_id: "attestor.example.org",
    pubkey: publicKeyBase64,
    algorithm: "Ed25519"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AgeToken Attestor PoC running on port ${PORT}`);
  console.log(`\nTest with:`);
  console.log(`curl -X POST http://localhost:${PORT}/issue_token \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"age":"13_15","aud":"com.example.app","nonce":"test123"}'`);
});

