import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';

export default function AdminVerifyOtp() {
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const u = searchParams.get('username');
    if (u) setUsername(u);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/verify-otp', { username, otp });
      if (res.data.success && res.data.resetToken) {
        // Small delay to show success then navigate
        setTimeout(() => {
          navigate(`/admin/reset-password?token=${encodeURIComponent(res.data.resetToken)}`);
        }, 600);
      } else {
        setError(res.data.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)]" />

        <div className="text-center mb-8">
          <h1 className="font-['Space_Grotesk'] text-2xl font-black tracking-wider text-[var(--accent-cyan)]">
            Verify OTP
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Enter the 6-digit OTP sent to your WhatsApp number.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center mb-4 bg-[rgba(255,0,0,0.1)] py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="mb-8">
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            OTP Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="● ● ● ● ● ●"
            required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] text-center letter-spacing-wide outline-none transition-all focus:border-[var(--accent-cyan)] font-mono"
            inputMode="numeric"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <p className="text-center mt-6 text-[0.68rem] text-[var(--text-muted)]">
          Didn't receive an OTP?{' '}
          <Link
            to="/admin/forgot-password"
            className="text-[var(--accent-cyan)] font-medium hover:underline no-underline"
          >
            Request again
          </Link>
        </p>
      </form>
    </div>
  );
}
