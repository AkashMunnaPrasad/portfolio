import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const location = useLocation();

  const startTransition = useCallback(() => {
    setShow(true);
    setLoading(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
          setTimeout(() => setShow(false), 200);
        }, 200);
      }
      setProgress(Math.min(p, 100));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = startTransition();
    return cleanup;
  }, [location.pathname, startTransition]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9997] flex flex-col items-center justify-center transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(6,11,20,0.95)' }}
    >
      <div className="font-['Space_Grotesk'] text-xs font-bold tracking-[0.3em] uppercase text-[var(--accent-cyan)] mb-6">
        Loading
      </div>
      <div className="w-[200px] h-[3px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
      </div>
      <div className="mt-3 text-[0.6rem] font-mono text-[var(--text-muted)]">
        {Math.floor(progress)}%
      </div>
    </div>
  );
}
