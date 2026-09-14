const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Returns a nodemailer transporter. If real SMTP creds are configured via
 * env vars, those are used. Otherwise (development / no creds provided),
 * an Ethereal test account is created automatically — emails aren't
 * really delivered, but a preview URL is logged so the flow can be tested
 * end-to-end without needing a real mail provider.
 */
async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return cachedTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('Using Ethereal test SMTP account:', testAccount.user);
  return cachedTransporter;
}

async function sendEmail({ to, subject, html }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Forno Pizza" <no-reply@fornopizza.com>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Preview email (${subject}) at: ${previewUrl}`);
  }
  return info;
}

async function sendVerificationEmail(user, rawToken) {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Forno Pizza account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome to Forno, ${user.name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#e6392a;color:#fff;text-decoration:none;border-radius:8px;">Verify Email</a></p>
        <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(user, rawToken) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your Forno Pizza password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Password reset requested</h2>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#e6392a;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
