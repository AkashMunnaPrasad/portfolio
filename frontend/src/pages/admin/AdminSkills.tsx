import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Skill } from '../../types';

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', percent: 50, level: 'Intermediate', icon: '', sort_order: 0 });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/skills');
      if (res.data.success) setSkills(res.data.skills);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setForm({ name: '', category: '', percent: 50, level: 'Intermediate', icon: '', sort_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (s: Skill) => {
    setForm({ name: s.name, category: s.category, percent: s.percent, level: s.level, icon: s.icon || '', sort_order: s.sort_order });
    setEditing(s);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/skills/${editing.id}`, form);
      } else {
        await api.post('/admin/skills', form);
      }
      resetForm();
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving skill');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await api.delete(`/admin/skills/${id}`);
    fetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">Skills</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
            + Add Skill
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 mb-8 max-w-[600px]">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-5">{editing ? 'Edit Skill' : 'New Skill'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (frontend, backend, tools, vlsi)" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.percent} onChange={(e) => setForm({ ...form, percent: Number(e.target.value) })} type="number" min={0} max={100} placeholder="Percent"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Level (Beginner, Intermediate, Advanced, Expert)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Icon class (e.g. fab fa-react)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} type="number" placeholder="Sort order"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm}
              className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {skills.map((s) => (
          <div key={s.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl text-[var(--accent-cyan)]"><i className={s.icon || 'fas fa-code'} /></span>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{s.category} · {s.percent}%</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                Edit
              </button>
              <button onClick={() => remove(s.id)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-red-400 bg-transparent cursor-pointer hover:border-red-400 transition-all">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
