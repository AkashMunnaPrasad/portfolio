import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Education } from '../../types';

export default function AdminEducation() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Education | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ degree: '', institution: '', location: '', start_date: '', end_date: '', current: false, description: '', sort_order: 0 });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/education');
      if (res.data.success) setItems(res.data.education);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setForm({ degree: '', institution: '', location: '', start_date: '', end_date: '', current: false, description: '', sort_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (item: Education) => {
    setForm({ degree: item.degree, institution: item.institution, location: item.location || '', start_date: item.start_date || '', end_date: item.end_date || '', current: item.current, description: item.description || '', sort_order: item.sort_order });
    setEditing(item);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/education/${editing.id}`, form);
      } else {
        await api.post('/admin/education', form);
      }
      resetForm();
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this education entry?')) return;
    await api.delete(`/admin/education/${id}`);
    fetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">Education</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
            + Add Education
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 mb-8 max-w-[700px]">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-5">{editing ? 'Edit Education' : 'New Education'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Institution" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Start date"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} placeholder="End date" disabled={form.current}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] disabled:opacity-40" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--text-secondary)] cursor-pointer flex items-center gap-2">
                <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} className="accent-[var(--accent-cyan)]" />
                Currently studying
              </label>
            </div>
            <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} type="number" placeholder="Sort order"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none mb-4 focus:border-[var(--accent-cyan)] resize-none" />
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

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.degree}</h3>
              <p className="text-xs text-[var(--accent-violet)]">{item.institution}{item.location ? ` · ${item.location}` : ''}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{item.start_date} - {item.current ? 'Present' : item.end_date}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(item)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                Edit
              </button>
              <button onClick={() => remove(item.id)}
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
