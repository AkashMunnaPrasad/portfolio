import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Certificate } from '../../types';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    date: '',
    credential_id: '',
    score: '',
    type: 'Elite',
    description: '',
    image_url: '' as string | null,
    published: true,
  });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/certificates');
      if (res.data.success) setCertificates(res.data.certificates);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setForm({
      title: '', issuer: '', date: '', credential_id: '', score: '', type: 'Elite',
      description: '', image_url: '', published: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (c: Certificate) => {
    setForm({ ...c });
    setEditing(c);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/certificates/${editing.id}`, form);
      } else {
        await api.post('/admin/certificates', form);
      }
      resetForm();
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving certificate');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    await api.delete(`/admin/certificates/${id}`);
    fetch();
  };

  const togglePublish = async (id: string) => {
    try {
      await api.patch(`/admin/certificates/${id}/publish`);
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating publish status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">Certificates</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
            + Add Certificate
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 mb-8 max-w-[700px]">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-5">{editing ? 'Edit Certificate' : 'New Certificate'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. CMOS Digital VLSI Design)" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Issuer (e.g. NPTEL · IIT Kharagpur)" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Date (e.g. Jan 2024)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.credential_id} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} placeholder="Credential ID"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="Score (e.g. 85%)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]">
              <option value="Elite">Elite</option>
              <option value="Distinction">Distinction</option>
              <option value="Pass">Pass</option>
              <option value="Completed">Completed</option>
            </select>
            <input value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Certificate image URL (optional)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[var(--accent-cyan)]" />
              Published
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What this certification covers..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
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
        {certificates.map((c) => (
          <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{c.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{c.issuer}</p>
              </div>
              <span className={`text-[0.58rem] font-bold px-2 py-0.5 rounded-full uppercase ${
                c.published
                  ? 'bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.2)]'
                  : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}>
                {c.published ? 'Live' : 'Draft'}
              </span>
            </div>
            {c.credential_id && (
              <div className="flex items-center gap-1 mb-3">
                <span className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">Credential ID</span>
                <span className="ml-auto font-mono text-[0.6rem] text-[var(--accent-cyan)] truncate max-w-[120px]">{c.credential_id}</span>
              </div>
            )}
            {c.score && (
              <p className="text-xs text-[var(--text-secondary)] mb-3">Score: {c.score}</p>
            )}
            <div className="flex gap-2 mt-auto">
              <button onClick={() => openEdit(c)}
                className="flex-1 text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                Edit
              </button>
              <button onClick={() => togglePublish(c.id)}
                className="flex-1 text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-violet)] hover:border-[var(--accent-violet)] transition-all">
                {c.published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => remove(c.id)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-red-400 bg-transparent cursor-pointer hover:border-red-400 transition-all">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && !showForm && (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)] text-sm">No certificates added yet.</p>
        </div>
      )}
    </div>
  );
}
