import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { SiteSettings } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    resume_url: '', github_url: '', linkedin_url: '', site_name: '', site_description: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.success) setSettings(res.data.settings);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      for (const [key, value] of Object.entries(settings)) {
        await api.put('/admin/settings', { key, value });
      }
      setMsg('Settings saved!');
    } catch {
      setMsg('Error saving settings');
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)] mb-8">Settings</h1>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 max-w-[600px]">
        <div className="space-y-5">
          {[
            { key: 'site_name', label: 'Site Name' },
            { key: 'site_description', label: 'Site Description' },
            { key: 'resume_url', label: 'Resume URL' },
            { key: 'github_url', label: 'GitHub URL' },
            { key: 'linkedin_url', label: 'LinkedIn URL' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">{label}</label>
              <input
                value={(settings as any)[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={label}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
              />
            </div>
          ))}
        </div>

        {msg && <p className="text-sm text-[var(--accent-cyan)] mt-4">{msg}</p>}

        <button onClick={handleSave} disabled={saving}
          className="mt-6 font-['Inter'] text-xs font-bold uppercase tracking-wider py-3 px-6 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,212,255,0.3)] disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
