const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const ENV = require('./config/env');
const routes = require('./routes');

const app = express();
const PORT = ENV.PORT;

app.set('trust proxy', true);

/* ── Security Middleware ── */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ENV.CORS_ORIGIN.split(','), methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

/* ── Static files for uploads ── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ── Rate Limiting ── */
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { success: false, message: 'Too many messages. Try again in an hour.' } });

app.use('/api/', apiLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/contact', contactLimiter);

/* ── API Routes ── */
app.use('/api', routes);

/* ── 404 handler ── */
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }
  res.status(404).json({ success: false, message: 'Not found.' });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║      PORTFOLIO BACKEND API SERVER       ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  API  → http://localhost:${PORT}/api       ║`);
  console.log(`║  Env  → ${ENV.NODE_ENV}                    ║`);
  console.log('╚══════════════════════════════════════════╝\n');
});

module.exports = app;
