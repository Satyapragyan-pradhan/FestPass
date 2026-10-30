/**
 * Ticket Token Cryptographic Helpers (Ed25519)
 *
 * Token Format: "FP1.<ticketId>.<eventId>.<signatureBase64url>"
 * Booth nodes hold the Ed25519 private key to issue tickets.
 * Gate nodes only hold the Ed25519 public key and can verify validity offline without network.
 */

const crypto = require('crypto');

const TOKEN_PREFIX = 'FP1';

/**
 * Generates an Ed25519 keypair in PEM format
 * @returns {{ publicKey: string, privateKey: string }}
 */
function generateEd25519KeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return { publicKey, privateKey };
}

/**
 * Normalizes a key input into a crypto.KeyObject or valid PEM
 * @private
 */
function normalizeKey(key, type) {
  if (typeof key === 'object' && key !== null && key.type) {
    return key;
  }
  if (typeof key === 'string') {
    const trimmed = key.trim();
    if (trimmed.startsWith('-----BEGIN')) {
      return type === 'private'
        ? crypto.createPrivateKey(trimmed)
        : crypto.createPublicKey(trimmed);
    }
    // If provided as single-line base64 PEM or base64 DER
    try {
      const pemHeader =
        type === 'private' ? '-----BEGIN PRIVATE KEY-----\n' : '-----BEGIN PUBLIC KEY-----\n';
      const pemFooter =
        type === 'private' ? '\n-----END PRIVATE KEY-----' : '\n-----END PUBLIC KEY-----';
      return type === 'private'
        ? crypto.createPrivateKey(`${pemHeader}${trimmed}${pemFooter}`)
        : crypto.createPublicKey(`${pemHeader}${trimmed}${pemFooter}`);
    } catch {
      return type === 'private' ? crypto.createPrivateKey(key) : crypto.createPublicKey(key);
    }
  }
  throw new TypeError(`Invalid ${type} key format`);
}

/**
 * Construct payload string to be signed
 * @private
 */
function getSignPayload(ticketId, eventId) {
  return `${TOKEN_PREFIX}.${ticketId}.${eventId}`;
}

/**
 * Signs ticket data and produces a tamper-proof Ed25519 token
 *
 * @param {Object} params
 * @param {string} params.ticketId
 * @param {string} params.eventId
 * @param {string|crypto.KeyObject} params.privateKey
 * @returns {string} Token string: "FP1.<ticketId>.<eventId>.<signatureBase64url>"
 */
function signTicket({ ticketId, eventId, privateKey }) {
  if (!ticketId || typeof ticketId !== 'string') {
    throw new TypeError('ticketId must be a non-empty string');
  }
  if (!eventId || typeof eventId !== 'string') {
    throw new TypeError('eventId must be a non-empty string');
  }
  if (!privateKey) {
    throw new TypeError('privateKey is required to sign ticket tokens');
  }

  const keyObj = normalizeKey(privateKey, 'private');
  const payload = getSignPayload(ticketId, eventId);
  const signature = crypto.sign(null, Buffer.from(payload, 'utf8'), keyObj);
  const signatureBase64url = signature.toString('base64url');

  return `${payload}.${signatureBase64url}`;
}

/**
 * Parses a ticket token string into its constituent parts
 *
 * @param {string} token
 * @returns {{ prefix: string, ticketId: string, eventId: string, signature: string }}
 */
function parseToken(token) {
  if (!token || typeof token !== 'string') {
    throw new TypeError('token must be a non-empty string');
  }

  const parts = token.trim().split('.');
  if (parts.length !== 4) {
    throw new Error(`Invalid token format: expected 4 segments, got ${parts.length}`);
  }

  const [prefix, ticketId, eventId, signature] = parts;
  if (prefix !== TOKEN_PREFIX) {
    throw new Error(`Invalid token prefix: expected "${TOKEN_PREFIX}", got "${prefix}"`);
  }
  if (!ticketId || !eventId || !signature) {
    throw new Error('Token contains empty segment');
  }

  return { prefix, ticketId, eventId, signature };
}

/**
 * Verifies an Ed25519 signed ticket token against a public key
 *
 * @param {Object} params
 * @param {string} params.token
 * @param {string|crypto.KeyObject} params.publicKey
 * @returns {{ valid: boolean, ticketId?: string, eventId?: string, error?: string }}
 */
function verifyTicket({ token, publicKey }) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token must be a non-empty string' };
    }
    if (!publicKey) {
      return { valid: false, error: 'publicKey is required to verify ticket tokens' };
    }

    const { prefix, ticketId, eventId, signature } = parseToken(token);
    const keyObj = normalizeKey(publicKey, 'public');
    const payload = `${prefix}.${ticketId}.${eventId}`;
    const sigBuffer = Buffer.from(signature, 'base64url');

    const valid = crypto.verify(null, Buffer.from(payload, 'utf8'), keyObj, sigBuffer);

    if (!valid) {
      return { valid: false, error: 'Signature verification failed: token is forged or tampered' };
    }

    return {
      valid: true,
      ticketId,
      eventId,
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message,
    };
  }
}

module.exports = {
  TOKEN_PREFIX,
  generateEd25519KeyPair,
  signTicket,
  verifyTicket,
  parseToken,
};
