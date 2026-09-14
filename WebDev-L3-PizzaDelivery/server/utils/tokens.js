const crypto = require('crypto');

// Generates a random token; returns both the raw token (sent to the user via
// email/link) and its SHA-256 hash (stored in DB). We never store the raw
// token, mirroring how password reset should work.
function generateRawAndHashedToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { generateRawAndHashedToken, hashToken };
