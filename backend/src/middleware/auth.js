const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }
  const token = header.replace('Bearer ', '');
  try {
    req.admin = jwt.verify(token, ENV.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = authAdmin;
