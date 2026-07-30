import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Contact } from '../../types';

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contacts');
      if (res.data.success) setContacts(res.data.contacts);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleRead = async (id: string, read: boolean) => {
    await api.patch(`/admin/contacts/${id}`, { read: !read });
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this contact message?')) return;
    await api.delete(`/admin/contacts/${id}`);
    fetch();
  };

  const viewMsg = async (contact: Contact) => {
    setSelected(contact);
    if (!contact.read) {
      await api.patch(`/admin/contacts/${contact.id}`, { read: true });
      fetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)] mb-8">Contacts</h1>

      {selected ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 max-w-[700px]">
          <button onClick={() => setSelected(null)} className="text-sm text-[var(--accent-cyan)] hover:underline cursor-pointer bg-none border-none mb-6">
            ← Back to list
          </button>
          <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-2">{selected.subject || '(No subject)'}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-1"><strong>From:</strong> {selected.name} ({selected.email})</p>
          <p className="text-xs text-[var(--text-muted)] mb-6">{new Date(selected.created_at).toLocaleString()}</p>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-5 whitespace-pre-wrap text-sm text-[var(--text-secondary)] leading-relaxed">
            {selected.message}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.length === 0 && <p className="text-[var(--text-muted)]">No contacts yet.</p>}
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => viewMsg(c)}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 cursor-pointer transition-all hover:border-[var(--border-hover)] flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {!c.read && <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shrink-0" />}
                  <p className={`text-sm font-semibold truncate ${c.read ? 'text-[var(--text-primary)]' : 'text-[var(--accent-cyan)]'}`}>
                    {c.name}
                  </p>
                  <span className="text-xs text-[var(--text-muted)]">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">{c.subject || '(No subject)'} — {c.message.slice(0, 80)}...</p>
              </div>
              <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleRead(c.id, c.read)}
                  className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                  {c.read ? 'Unread' : 'Read'}
                </button>
                <button onClick={() => remove(c.id)}
                  className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-red-400 bg-transparent cursor-pointer hover:border-red-400 transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
