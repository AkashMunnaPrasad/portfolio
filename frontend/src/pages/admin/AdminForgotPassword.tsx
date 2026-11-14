import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function AdminForgotPassword() {
  const [username, setUsername] = useState('admin');
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [error, setError] = useState('');
  const [sentInfo, setSentInfo] = useState<{ channels?: string[]; sentVia?: string; demo?: boolean }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/forgot-password', { username });
      if (res.data.success) {
        setSentInfo(res.data);
        setStep('sent');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const navigateToVerify = () => {
    navigate(`/admin/verify-otp?username=${encodeURIComponent(username)}`);
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
            Forgot Password
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            An OTP will be sent to your WhatsApp and email to reset your admin password.
          </p>
        </div>

        {step === 'request' && (
          <>
            {error && (
              <p className="text-sm text-red-400 text-center mb-4 bg-[rgba(255,0,0,0.1)] py-2 px-3 rounded-lg">
                {error}
              </p>
            )}
            <div className="mb-6">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent-cyan)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  WhatsApp Number
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)]">+91 8252336811</p>
                <p className="text-[0.65rem] text-[var(--text-muted)] mt-1">
                  OTP via WhatsApp
                </p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Email Address
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">deskamp33@gmail.com</p>
                <p className="text-[0.65rem] text-[var(--text-muted)] mt-1">
                  OTP via Email
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p className="text-center mt-6 text-[0.68rem] text-[var(--text-muted)]">
              Remember your password?{' '}
              <Link
                to="/admin/login"
                className="text-[var(--accent-cyan)] font-medium hover:underline no-underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 'sent' && (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[rgba(0,212,255,0.1)] flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-[var(--accent-cyan)] text-xl" />
              </div>
              <h2 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">
                OTP Sent
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                An OTP has been sent via {sentInfo?.sentVia || 'WhatsApp and Email'}. Check both to find the code.
              </p>
              {sentInfo?.demo && (
                <p className="text-[0.65rem] text-[var(--accent-cyan)] mt-3">
                  Demo mode: OTP is shown in server console if delivery credentials are not configured.
                </p>
              )}
            </div>
            <button
              onClick={navigateToVerify}
              className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Verify OTP
            </button>
            <p className="text-center mt-6 text-[0.68rem] text-[var(--text-muted)]">
              Didn't receive the OTP?{' '}
              <button
                type="button"
                onClick={handleSubmit}
                className="text-[var(--accent-cyan)] font-medium hover:underline no-underline bg-transparent p-0"
              >
                Resend
              </button>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
