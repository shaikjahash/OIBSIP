const jwt = require('jsonwebtoken');

function signAuthToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signAuthToken, verifyAuthToken };
