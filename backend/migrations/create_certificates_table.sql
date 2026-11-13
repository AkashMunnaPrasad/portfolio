-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates the certificates table managed by the admin.

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT,
  credential_id TEXT,
  score TEXT,
  type TEXT,
  description TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Optional index for faster public lookups
CREATE INDEX IF NOT EXISTS idx_certificates_published ON certificates(published);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);
