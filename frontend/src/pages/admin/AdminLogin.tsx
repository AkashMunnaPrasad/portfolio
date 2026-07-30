import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(username, password);
      if (success) navigate('/admin');
      else setError('Invalid credentials');
    } catch (err: any) {
      setError(err.message);
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
          <h1 className="font-['Space_Grotesk'] text-2xl font-black tracking-wider text-[var(--accent-cyan)]">Admin Login</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Sign in to manage your portfolio</p>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center mb-4 bg-[rgba(255,0,0,0.1)] py-2 px-3 rounded-lg">{error}</p>
        )}

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-4 transition-all focus:border-[var(--accent-cyan)]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-6 transition-all focus:border-[var(--accent-cyan)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,212,255,0.35)] disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
