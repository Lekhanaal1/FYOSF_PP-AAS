"""
AgeToken Validator - Python/Flask Implementation

This validates signature and TTL using public key bundle.
In production, use key rotation, verify attestor cert chain,
and maintain CRL/OCSP checks.

Dependencies: flask, pynacl, base64url
Install: pip install flask pynacl base64url
"""

from flask import Flask, request, jsonify
import base64
import time
import json
import nacl.signing
import nacl.encoding
import base64url

app = Flask(__name__)

# Example public key – in production fetch attestor public keys bundle securely
# This should match the public key from the attestor
# Set this after starting the attestor and getting its public key
pubkey_b64 = None  # Will be set via /set_public_key endpoint

public_key = None


def set_public_key(pubkey_base64):
    """Set the attestor public key for validation"""
    global public_key, pubkey_b64
    pubkey_b64 = pubkey_base64
    try:
        public_key = nacl.signing.VerifyKey(base64.b64decode(pubkey_base64))
        return True
    except Exception as e:
        print(f"Error setting public key: {e}")
        return False


def validate_compact_token(compact_token, expected_aud):
    """
    Validate a compact AgeToken
    
    Args:
        compact_token: Token in format <base64url(payload)>.<base64url(signature)>
        expected_aud: Expected audience (platform identifier)
    
    Returns:
        (bool, dict|str): (is_valid, payload_or_error_message)
    """
    global public_key
    
    if public_key is None:
        return False, "Public key not set. Call /set_public_key first."
    
    try:
        # Split token into payload and signature
        parts = compact_token.split('.')
        if len(parts) != 2:
            return False, "Invalid token format"
        
        payload_b64, sig_b64 = parts
        
        # Decode payload and signature
        payload_json = base64url.decode(payload_b64)
        sig = base64url.decode(sig_b64)
        
        # Verify signature
        public_key.verify(payload_json.encode('utf-8'), sig)
        
        # Parse payload
        payload = json.loads(payload_json)
        
        # Check expiration
        now = int(time.time())
        if payload.get('exp', 0) < now:
            return False, "Token expired"
        
        # Check audience
        if payload.get('aud') != expected_aud:
            return False, "Audience mismatch"
        
        # TODO: Optional nonce check against short-term cache to prevent replay
        # Use Redis cache keyed by 'tid' or 'nonce' with TTL = token lifetime
        
        return True, payload
        
    except nacl.exceptions.BadSignatureError:
        return False, "Invalid signature"
    except json.JSONDecodeError:
        return False, "Invalid payload format"
    except Exception as e:
        return False, f"Validation error: {str(e)}"


@app.route('/set_public_key', methods=['POST'])
def set_pubkey():
    """Set the attestor public key (for PoC convenience)"""
    data = request.json
    pubkey = data.get('pubkey')
    
    if not pubkey:
        return jsonify({"error": "Missing pubkey"}), 400
    
    if set_public_key(pubkey):
        return jsonify({"status": "Public key set successfully"}), 200
    else:
        return jsonify({"error": "Failed to set public key"}), 400


@app.route('/validate_token', methods=['POST'])
def validate_token():
    """
    Validate an AgeToken
    
    Request body:
    {
        "token": "<compact_token>",
        "aud": "com.example.app"
    }
    """
    data = request.json
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    token = data.get('token')
    appid = data.get('aud')
    
    if not token or not appid:
        return jsonify({"error": "Missing token or aud"}), 400
    
    ok, info = validate_compact_token(token, appid)
    
    if ok:
        return jsonify({
            "valid": True,
            "payload": info,
            "is_minor": info.get('age') in ['UNDER_13', '13_15', '16_17']
        }), 200
    else:
        return jsonify({
            "valid": False,
            "error": info
        }), 400


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "public_key_set": public_key is not None
    }), 200


if __name__ == '__main__':
    print("AgeToken Validator PoC")
    print("=" * 50)
    print("1. Start the attestor and get its public key")
    print("2. POST to /set_public_key with: {\"pubkey\": \"<base64_key>\"}")
    print("3. POST to /validate_token with token and audience")
    print("=" * 50)
    app.run(port=5001, debug=True)

