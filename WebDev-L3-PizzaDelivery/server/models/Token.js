const mongoose = require('mongoose');

// Shared shape for both token types; kept as two collections per the DB design
// so verification and reset tokens don't collide and can expire independently.
const tokenFields = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
};

const emailVerificationTokenSchema = new mongoose.Schema(tokenFields, { timestamps: true });
const passwordResetTokenSchema = new mongoose.Schema(tokenFields, { timestamps: true });

// TTL indexes: MongoDB auto-deletes expired token docs.
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  EmailVerificationToken: mongoose.model('EmailVerificationToken', emailVerificationTokenSchema),
  PasswordResetToken: mongoose.model('PasswordResetToken', passwordResetTokenSchema),
};
