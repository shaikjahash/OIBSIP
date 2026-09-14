const User = require('../models/User');
const { EmailVerificationToken, PasswordResetToken } = require('../models/Token');
const { generateRawAndHashedToken, hashToken } = require('../utils/tokens');
const { signAuthToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password });

  const { raw, hash } = generateRawAndHashedToken();
  await EmailVerificationToken.create({
    user: user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  });

  try {
    await sendVerificationEmail(user, raw);
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    user: user.toSafeJSON(),
  });
});

// GET /api/auth/verify-email?token=...&email=...
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) {
    return res.status(400).json({ message: 'Invalid verification link' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: 'Invalid verification link' });
  }

  if (user.isEmailVerified) {
    return res.status(200).json({ message: 'This account is already verified', alreadyVerified: true });
  }

  const tokenHash = hashToken(String(token));
  const record = await EmailVerificationToken.findOne({
    user: user._id,
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ message: 'Verification link is invalid or has expired' });
  }

  user.isEmailVerified = true;
  await user.save();
  record.used = true;
  await record.save();

  res.json({ message: 'Email verified successfully. You can now log in.' });
});

// POST /api/auth/resend-verification
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Don't leak whether the email exists.
  if (!user || user.isEmailVerified) {
    return res.json({ message: 'If that account exists and is unverified, a new link has been sent.' });
  }

  const { raw, hash } = generateRawAndHashedToken();
  await EmailVerificationToken.create({
    user: user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  });
  await sendVerificationEmail(user, raw);

  res.json({ message: 'If that account exists and is unverified, a new link has been sent.' });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      message: 'Please verify your email before logging in',
      requiresVerification: true,
    });
  }

  const token = signAuthToken(user);
  res.json({ token, user: user.toSafeJSON() });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking account existence.
  const genericResponse = { message: 'If that email is registered, a reset link has been sent.' };

  if (!user) return res.json(genericResponse);

  const { raw, hash } = generateRawAndHashedToken();
  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  try {
    await sendPasswordResetEmail(user, raw);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
  }

  res.json(genericResponse);
});

// POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password, confirmPassword } = req.body;

  if (!token || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired' });
  }

  const tokenHash = hashToken(String(token));
  const record = await PasswordResetToken.findOne({
    user: user._id,
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired' });
  }

  user.password = password; // re-hashed by pre-save hook
  await user.save();
  record.used = true;
  await record.save();

  res.json({ message: 'Password reset successfully. You can now log in.' });
});
