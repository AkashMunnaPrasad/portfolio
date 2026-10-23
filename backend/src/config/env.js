const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });

const clean = (value) => (value || '').trim();

const NODE_ENV = clean(process.env.NODE_ENV) || 'development';
const isProduction =
  NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  process.env.RAILWAY_ENVIRONMENT === 'production';

const JWT_SECRET = clean(process.env.JWT_SECRET);
const ADMIN_PASS = clean(process.env.ADMIN_PASS);
const CORS_ORIGIN = clean(process.env.CORS_ORIGIN);

const weakJwtSecret = !JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'fallback_secret_change_me';
const weakAdminPassword = !ADMIN_PASS || ADMIN_PASS.length < 10 || ADMIN_PASS === 'Admin@1234';

const problems = [];
if (isProduction) {
  if (weakJwtSecret) {
    problems.push('JWT_SECRET is missing, shorter than 32 characters, or uses the old default.');
  }
  if (weakAdminPassword) {
    problems.push('ADMIN_PASS is missing, shorter than 10 characters, or is still the default "Admin@1234".');
  }
  if (!clean(process.env.SUPABASE_URL) || !clean(process.env.SUPABASE_SERVICE_KEY)) {
    problems.push('SUPABASE_URL / SUPABASE_SERVICE_KEY are not configured.');
  }
  if (!CORS_ORIGIN) {
    problems.push('CORS_ORIGIN is not configured (comma-separated list of allowed frontend origins).');
  }
}

if (problems.length > 0) {
  console.error('\n[SECURITY CONFIG ERROR]');
  problems.forEach((problem) => console.error(` - ${problem}`));
  console.error('Fix these in your hosting dashboard. Admin login is disabled until the password issue is fixed.\n');
}

/*
 * Never fall back to a publicly known JWT secret in production. If the secret
 * is weak, generate an ephemeral one so tokens cannot be forged (sessions will
 * be invalidated on restart until a real secret is configured).
 */
const jwtSecret = weakJwtSecret
  ? isProduction
    ? crypto.randomBytes(48).toString('hex')
    : 'dev-only-insecure-secret-do-not-use-in-production'
  : JWT_SECRET;

const ENV = {
  PORT: Number(clean(process.env.PORT)) || 5000,
  NODE_ENV,
  IS_PRODUCTION: isProduction,
  SUPABASE_URL: clean(process.env.SUPABASE_URL),
  SUPABASE_SERVICE_KEY: clean(process.env.SUPABASE_SERVICE_KEY),
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: clean(process.env.JWT_EXPIRES_IN) || '8h',
  ADMIN_USER: clean(process.env.ADMIN_USER) || 'admin',
  ADMIN_PASS: ADMIN_PASS || 'Admin@1234',
  ADMIN_EMAIL: clean(process.env.ADMIN_EMAIL) || 'admin@example.com',
  MAIL_USER: clean(process.env.MAIL_USER),
  MAIL_PASS: clean(process.env.MAIL_PASS),
  CORS_ORIGIN: CORS_ORIGIN || 'http://localhost:5173',
  CORS_ORIGINS: CORS_ORIGIN
    ? CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [],
  LOGIN_DISABLED: isProduction && weakAdminPassword,
};

module.exports = ENV;
