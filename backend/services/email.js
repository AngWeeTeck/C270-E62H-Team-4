const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendPasswordResetEmail({ email, username, resetUrl }) {
  const mailer = getTransporter();

  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Development password reset for ${email}: ${resetUrl}`);
      return { developmentResetUrl: resetUrl };
    }
    throw new Error('SMTP is not configured.');
  }

  await mailer.sendMail({
    from: process.env.MAIL_FROM || 'Thread Quest <no-reply@threadquest.local>',
    to: email,
    subject: 'Reset your Thread Quest password',
    text: `Hi ${username},\n\nReset your password using this link: ${resetUrl}\n\nThe link expires in 30 minutes. If you did not request it, ignore this email.`,
    html: `<p>Hi ${username},</p><p>Use the link below to reset your Thread Quest password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
  });

  return {};
}

module.exports = { sendPasswordResetEmail };
