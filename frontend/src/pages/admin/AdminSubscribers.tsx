import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';

interface Subscriber {
  id: string;
  email: string;
  ip_address: string;
  active: boolean;
  created_at: string;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscribers');
      if (res.data.success) setSubscribers(res.data.subscribers);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    try {
      await api.delete(`/admin/subscribers/${encodeURIComponent(email)}`);
      fetch();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">Subscribers</h1>
        <span className="text-sm text-[var(--text-muted)]">{subscribers.length} total</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left text-[0.7rem] uppercase tracking-widest">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Subscribed</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] text-[var(--text-primary)]">
                  <td className="py-3 pr-4">{s.email}</td>
                  <td className="py-3 pr-4 text-[var(--text-muted)]">{s.ip_address || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${s.active ? 'bg-[rgba(0,255,136,0.15)] text-green-400' : 'bg-[rgba(255,0,0,0.15)] text-red-400'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[var(--text-muted)] text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleRemove(s.email)}
                      className="text-xs text-red-400 hover:text-red-300 bg-transparent border border-[rgba(255,0,0,0.3)] rounded px-3 py-1 cursor-pointer transition-all hover:bg-[rgba(255,0,0,0.1)]"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
