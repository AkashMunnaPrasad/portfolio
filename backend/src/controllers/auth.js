const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const adminCredentials = {
  username: ENV.ADMIN_USER,
  passwordHash: bcrypt.hashSync(ENV.ADMIN_PASS, 12),
};

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }
  if (username !== adminCredentials.username) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
  const match = bcrypt.compareSync(password, adminCredentials.passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
  const token = jwt.sign({ username, role: 'admin' }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
  res.json({ success: true, token, expiresIn: 28800, username });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }
  const match = bcrypt.compareSync(currentPassword, adminCredentials.passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Current password incorrect.' });
  }
  adminCredentials.passwordHash = bcrypt.hashSync(newPassword, 12);
  res.json({ success: true, message: 'Password updated.' });
}

function verifyToken(req, res) {
  res.json({ success: true, admin: req.admin });
}

module.exports = { login, changePassword, verifyToken };
