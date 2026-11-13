-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Stores viewer session/IP details whenever someone views a certificate.
-- This data is for the ADMIN only and is never shown to the public user.

CREATE TABLE IF NOT EXISTS certificate_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  ip TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  screen TEXT,
  language TEXT,
  timezone TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_views_cert_id ON certificate_views(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_views_viewed_at ON certificate_views(viewed_at DESC);
