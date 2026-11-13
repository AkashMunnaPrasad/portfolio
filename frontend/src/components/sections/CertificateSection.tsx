import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import type { Certificate } from '../../types';

interface SessionInfo {
  ip: string | null;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  timezone: string;
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua)) return 'Google Chrome';
  if (/Safari\//i.test(ua)) return 'Apple Safari';
  if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
  return 'Unknown Browser';
}

function detectOS(ua: string): string {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac|iPhone|iPad/i.test(ua)) return 'macOS / iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

export default function CertificateSection() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const session: SessionInfo = {
    ip: null, // filled asynchronously; never shown to the public user
    browser: detectBrowser(navigator.userAgent),
    os: detectOS(navigator.userAgent),
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    screen: `${screen.width} × ${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Fetch the viewer's public IP (best-effort). This is sent to the admin only.
  const fetchIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      const data = (await res.json()) as { ip?: string };
      if (data.ip) session.ip = data.ip;
    } catch {
      // IP detection unavailable — leave as null.
    }
  };

  // Record that this viewer saw the certificate section.
  // The IP/session details are stored for the ADMIN and are never exposed to the user.
  const trackViews = async () => {
    await fetchIP();
    await Promise.all(
      certificates.map((c) =>
        api.post(`/certificates/${c.id}/view`, {
          browser: session.browser,
          os: session.os,
          device: session.device,
          screen: session.screen,
          language: session.language,
          timezone: session.timezone,
        }).catch(() => {})
      )
    );
  };

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      if (res.data.success) setCertificates(res.data.certificates);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
    // trackViews runs after certificates load so we know which IDs to ping
  }, []);

  useEffect(() => {
    if (!loading && certificates.length > 0) trackViews();
  }, [loading, certificates]);

  if (loading) {
    return (
      <section className="py-24 px-[8%] bg-[var(--bg-primary)]">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-[8%] bg-[var(--bg-primary)]">
      <div className="text-center mb-16">
        <h2 className="font-['Space_Grotesk'] text-[clamp(2rem,5vw,3rem)] font-black tracking-wider uppercase mb-3">
          MY <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">CERTIFICATIONS</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase">Verified credentials &amp; achievements</p>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: certificates.indexOf(c) * 0.08 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 transition-all hover:border-[var(--border-hover)] hover:-translate-y-2 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--accent-cyan)] font-bold text-[0.62rem] tracking-widest uppercase bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] px-2.5 py-0.5 rounded-full">
                {c.type}
              </span>
              <span className="ml-auto text-[0.6rem] font-bold text-[var(--text-muted)] tracking-wider uppercase">{c.date}</span>
            </div>
            <h4 className="font-['Space_Grotesk'] text-sm font-extrabold tracking-wider uppercase text-[var(--text-primary)] mb-2">
              {c.title}
            </h4>
            <p className="text-xs text-[var(--accent-violet)] font-medium mb-3 flex items-center gap-1.5">
              <i className="fas fa-university" /> {c.issuer}
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Credential ID</span>
                <span className="font-mono text-[var(--accent-cyan)] font-bold text-[0.62rem] truncate">{c.credential_id || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Score</span>
                <span className="font-bold text-[var(--text-primary)]">{c.score || '—'}</span>
              </div>
            </div>
            {c.description && (
              <p className="text-[0.68rem] text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">{c.description}</p>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(c.credential_id || c.title);
              }}
              className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--accent-cyan)] text-[var(--accent-cyan)] text-[0.68rem] font-bold tracking-widest uppercase transition-all hover:bg-[var(--accent-glow)] hover:-translate-y-0.5"
            >
              Copy Credential ID
            </button>
          </motion.div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)] text-sm">No certifications added yet.</p>
        </div>
      )}
    </section>
  );
}
