import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';

export default function AdminResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setResetToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetToken) {
      setError('Invalid session. Please request a new password reset.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/reset-password', {
        resetToken,
        newPassword,
      });
      if (res.data.success) {
        setTimeout(() => {
          navigate('/admin/login');
        }, 800);
      } else {
        setError(res.data.message || 'Password reset failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
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
            Reset Password
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Create a new password for your admin account.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center mb-4 bg-[rgba(255,0,0,0.1)] py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="mb-6">
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-2 transition-all focus:border-[var(--accent-cyan)]"
          />
          <p className="text-[0.65rem] text-[var(--text-muted)]">
            Must be at least 8 characters.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent-cyan)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !resetToken}
          className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
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
      </form>
    </div>
  );
}
