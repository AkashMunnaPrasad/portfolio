const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimitModule = require('express-rate-limit');
const path = require('path');
const ENV = require('./config/env');
const routes = require('./routes');

const rateLimit = rateLimitModule.rateLimit || rateLimitModule;
const ipKeyGenerator = rateLimitModule.ipKeyGenerator;

const app = express();
const PORT = ENV.PORT;

/*
 * Render sits behind Cloudflare. Trust only the first proxy hop so a client
 * cannot spoof X-Forwarded-For and bypass rate limiting.
 */
app.set('trust proxy', 1);
app.disable('x-powered-by');

/* ── Security middleware ── */
app.use(helmet({
  contentSecurityPolicy: false,
  // Uploaded images must be embeddable from the Vercel frontend.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/*
 * CORS: allow the production site, local development, any extra origins from
 * CORS_ORIGIN, and Vercel preview deployments. CORS is not an auth boundary;
 * admin endpoints still require a signed JWT.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://portfolio-omega-ochre-71.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];
const configuredOrigins = ENV.CORS_ORIGINS;
const allowAllOrigins = configuredOrigins.includes('*');
const allowedOrigins = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...configuredOrigins.filter((origin) => origin !== '*'),
]);
const vercelPreviewPattern = /^https:\/\/portfolio-[a-z0-9-]+\.vercel\.app$/i;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowAllOrigins) return true;
  if (allowedOrigins.has(origin)) return true;
  return vercelPreviewPattern.test(origin);
}

app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn('[CORS] Blocked origin:', origin);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

/* ── Static files for legacy uploads ── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '30d',
  immutable: true,
  index: false,
  dotfiles: 'deny',
}));

/* ── Rate limiting ── */
function clientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  const ip = (typeof cfIp === 'string' && cfIp.trim()) || req.ip || '0.0.0.0';
  return ipKeyGenerator(ip);
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/health',
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many messages. Try again in an hour.' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many password reset requests. Try again in an hour.' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many OTP attempts. Try again later.' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many password reset attempts. Try again in an hour.' },
});

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many subscription attempts. Try again later.' },
});

const trackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { success: false, message: 'Too many requests.' },
});

app.use('/api/', apiLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/contact', contactLimiter);
app.use('/api/newsletter', newsletterLimiter);
app.use('/api/visitor/track', trackLimiter);
app.use('/api/admin/forgot-password', forgotPasswordLimiter);
app.use('/api/admin/verify-otp', otpLimiter);
app.use('/api/admin/reset-password', resetPasswordLimiter);

/* ── API routes ── */
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
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large.'
      : 'Invalid file upload.';
    return res.status(400).json({ success: false, message });
  }
  if (err.message && err.message.startsWith('Unsupported file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('[ERROR]', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

/* ── Start ── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n┌──────────────────────────────────────────┐');
    console.log('│      PORTFOLIO BACKEND API SERVER        │');
    console.log('├──────────────────────────────────────────┤');
    console.log(`│  API  → http://localhost:${PORT}/api`);
    console.log(`│  Env  → ${ENV.NODE_ENV}`);
    console.log(`│  CORS → ${ENV.CORS_ORIGINS.join(', ') || 'defaults'}`);
    console.log('└──────────────────────────────────────────┘\n');
    if (ENV.LOGIN_DISABLED) {
      console.warn('[SECURITY] Admin login is disabled until ADMIN_PASS is set to a strong value.');
    }
  });
}

module.exports = app;
