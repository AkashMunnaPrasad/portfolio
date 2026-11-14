const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMailer } = require('../utils/email');
const ENV = require('../config/env');

const adminCredentials = {
  username: ENV.ADMIN_USER,
  passwordHash: bcrypt.hashSync(ENV.ADMIN_PASS, 12),
};

/* ── Runtime password override (set after OTP-verified reset) ── */
let adminPasswordOverride = null; // { hash, expiresAt }

/* ── In-memory OTP store ── */
const otpStore = new Map(); // key -> { otp, expiresAt, attempts }
const resetTokens = new Map(); // token -> { username, expiresAt }

const OTP_TTL_MS = 5 * 60 * 1000;      // 5 minutes
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes
const WHATSAPP_TO = ENV.ADMIN_WHATSAPP || '8252336811';
const OTP_EMAIL_TO = ENV.ADMIN_OTP_EMAIL || 'deskamp33@gmail.com';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* ── Send OTP via WhatsApp (Twilio) ── */
async function sendWhatsappOtp(phone, otp) {
  const accountSid = ENV.TWILIO_ACCOUNT_SID;
  const authToken = ENV.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = ENV.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

  if (accountSid && authToken && fromWhatsApp) {
    try {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your admin password reset OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        from: fromWhatsApp,
        to: `whatsapp:${phone}`,
      });
      return { success: true, channel: 'whatsapp' };
    } catch (err) {
      console.error('[TWILIO ERROR]', err.message);
    }
  }

  /* ── Fallback: log OTP to console (demo / no WhatsApp credentials) ── */
  console.log(`
╔══════════════════════════════════════════╗
║  WHATSAPP OTP (demo mode)              ║
║  To: ${phone}
║  OTP: ${otp}
║  Valid for: 5 minutes                  ║
╚════════════════════════════════════════╝
`);
  return { success: true, channel: 'whatsapp', demo: true };
}

/* ── Send OTP via Email (nodemailer / Gmail) ── */
async function sendOtpEmail(to, otp) {
  const mailer = getMailer();
  if (!mailer) {
    console.log(`
╔══════════════════════════════════════════╗
║  EMAIL OTP (demo mode - no SMTP creds)   ║
║  To: ${to}
║  OTP: ${otp}
║  Valid for: 5 minutes                    ║
╚════════════════════════════════════════╝
`);
    return { success: true, channel: 'email', demo: true };
  }
  try {
    await mailer.sendMail({
      from: `"Portfolio Admin" <${ENV.MAIL_USER}>`,
      to,
      subject: 'Admin Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;background:#060b14;padding:32px;color:#e8f4ff">
          <div style="max-width:560px;margin:0 auto;background:#0f1a2e;border-radius:14px;border:1px solid rgba(0,212,255,.2);padding:32px">
            <h2 style="color:#00d4ff;margin-top:0">Admin Password Reset</h2>
            <p>Your OTP code for admin password reset is:</p>
            <div style="font-size:2rem;letter-spacing:8px;font-weight:bold;color:#fff;background:#0b1220;padding:16px;border-radius:8px;text-align:center;display:inline-block;margin:20px 0">${otp}</div>
            <p style="font-size:.85rem;color:#4a6080">Valid for 5 minutes. Do not share this code.</p>
          </div>
        </div>
      `,
      text: `Your admin password reset OTP is: ${otp}. Valid for 5 minutes.`,
    });
    return { success: true, channel: 'email' };
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return { success: false, channel: 'email', error: err.message };
  }
}

function getEffectivePasswordHash() {
  const now = Date.now();
  if (adminPasswordOverride && now < adminPasswordOverride.expiresAt) {
    return adminPasswordOverride.hash;
  }
  adminPasswordOverride = null;
  return adminCredentials.passwordHash;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function toSeconds(value) {
  if (/^\d+$/.test(value)) return Number(value);
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 28800;
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * multipliers[match[2]];
}

async function login(req, res) {
  if (ENV.LOGIN_DISABLED) {
    return res.status(503).json({
      success: false,
      message: 'Admin login is disabled. Set a strong ADMIN_PASS in the hosting environment first.',
    });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }
    if (!safeEqual(username, adminCredentials.username)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const match = bcrypt.compareSync(password, getEffectivePasswordHash());
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ username, role: 'admin' }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || '8h',
    });
    res.json({
      success: true,
      token,
      expiresIn: toSeconds(ENV.JWT_EXPIRES_IN || '8h'),
      username,
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

function verifyToken(req, res) {
  res.json({ success: true, admin: req.admin });
}

/* ── Forgot password: send OTP via WhatsApp + Email ── */
async function forgotPassword(req, res) {
  const { username } = req.body || {};
  if (!username || username !== adminCredentials.username) {
    return res.status(400).json({ success: false, message: 'Invalid username.' });
  }

  const now = Date.now();
  const key = username;
  const existing = otpStore.get(key);
  if (existing && now < existing.expiresAt) {
    return res.status(429).json({
      success: false,
      message: 'An OTP was already sent. Please wait before requesting another.',
    });
  }

  const otp = generateOtp();
  otpStore.set(key, {
    otp,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
  });

  /* Send via WhatsApp AND Email (parallel) */
  const [whatsappResult, emailResult] = await Promise.allSettled([
    sendWhatsappOtp(WHATSAPP_TO, otp),
    sendOtpEmail(OTP_EMAIL_TO, otp),
  ]);

  const channels = [];
  if (whatsappResult.status === 'fulfilled') channels.push(whatsappResult.value.channel || 'whatsapp');
  if (emailResult.status === 'fulfilled') channels.push(emailResult.value.channel || 'email');

  const sentVia = channels.length > 0 ? channels.join(' + ') : 'console';
  const demo = (whatsappResult.status === 'fulfilled' && whatsappResult.value.demo) ||
    (emailResult.status === 'fulfilled' && emailResult.value.demo);

  res.json({
    success: true,
    message: `OTP sent via ${sentVia}.`,
    sentVia,
    demo,
    channels,
  });
}

/* ── Verify OTP and issue a short-lived reset token ── */
async function verifyOtp(req, res) {
  const { username, otp } = req.body || {};
  if (!username || username !== adminCredentials.username || !otp) {
    return res.status(400).json({ success: false, message: 'Username and OTP required.' });
  }

  const now = Date.now();
  const record = otpStore.get(username);
  if (!record || now > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found. Request a new one.' });
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(username);
    return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
  }

  if (record.otp !== String(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }

  otpStore.delete(username);

  const token = generateResetToken();
  resetTokens.set(token, {
    username,
    expiresAt: now + RESET_TOKEN_TTL_MS,
  });

  res.json({ success: true, resetToken: token });
}

/* ── Reset password with valid reset token ── */
async function resetPassword(req, res) {
  const { resetToken, newPassword } = req.body || {};
  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  const now = Date.now();
  const record = resetTokens.get(resetToken);
  if (!record || now > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Reset token expired or invalid.' });
  }

  resetTokens.delete(resetToken);

  const hash = bcrypt.hashSync(newPassword, 12);
  adminPasswordOverride = {
    hash,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000, // override valid for 7 days
  };

  res.json({ success: true, message: 'Password reset successfully. You can now log in with the new password.' });
}

module.exports = { login, verifyToken, forgotPassword, verifyOtp, resetPassword, getEffectivePasswordHash };
