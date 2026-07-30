import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Analytics } from '../../types';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => {
      if (res.data.success) setAnalytics(res.data.analytics);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)] mb-8">Analytics</h1>

      {analytics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Visits', val: analytics.total },
              { label: 'Today', val: analytics.today },
              { label: 'This Week', val: analytics.week },
              { label: 'This Month', val: analytics.month },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 text-center">
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--accent-cyan)]">{s.val}</p>
                <p className="text-[0.68rem] uppercase tracking-widest text-[var(--text-muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Top Pages</h3>
              <div className="space-y-2">
                {analytics.topPages.map((p) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] truncate">{p.page || '/'}</span>
                    <span className="text-[var(--accent-cyan)] font-semibold">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Devices</h3>
              <div className="space-y-3">
                {Object.entries(analytics.devices).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{device}</span>
                    <span className="text-[var(--accent-cyan)] font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Top Referrers</h3>
              <div className="space-y-2">
                {analytics.topReferrers.map((r) => (
                  <div key={r.source} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)] truncate">{r.source}</span>
                    <span className="text-[var(--accent-cyan)] font-semibold">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Daily Visits (14 days)</h3>
              <div className="space-y-2">
                {analytics.dailyVisits.map((d) => (
                  <div key={d.date} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-[var(--accent-cyan)] font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!analytics && (
        <p className="text-[var(--text-muted)]">No analytics data yet.</p>
      )}
    </div>
  );
}
