import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { DashboardSummary } from '../../types';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => {
      if (res.data.success) setSummary(res.data.summary);
    }).catch(() => {});
  }, []);

  const cards = summary
    ? [
        { label: 'Contacts', val: summary.contacts, icon: 'fas fa-envelope', color: 'var(--accent-cyan)' },
        { label: 'Subscribers', val: summary.subscribers, icon: 'fas fa-users', color: 'var(--accent-violet)' },
        { label: 'Projects', val: summary.projects, icon: 'fas fa-project-diagram', color: '#00ff88' },

        { label: 'Experiences', val: summary.experiences, icon: 'fas fa-briefcase', color: '#ffd93d' },
        { label: 'Education', val: summary.education, icon: 'fas fa-graduation-cap', color: '#6bcbff' },
      ]
    : [];

  return (
    <div>
      <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)] mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `rgba(0,212,255,0.1)`, color: card.color }}
              >
                <i className={card.icon} />
              </div>
              <div>
                <p className="text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)]">{card.label}</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--text-primary)]">{card.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!summary && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
