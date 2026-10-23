const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const adminCredentials = {
  username: ENV.ADMIN_USER,
  passwordHash: bcrypt.hashSync(ENV.ADMIN_PASS, 12),
};

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
    const match = bcrypt.compareSync(password, adminCredentials.passwordHash);
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

module.exports = { login, verifyToken };
