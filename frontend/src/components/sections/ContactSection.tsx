import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await api.post('/contact', form);
      if (res.data.success) {
        setStatus({ type: 'success', text: "Thanks! I'll get back to you within 24 hours." });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', text: res.data.errors?.join(' ') || res.data.message || 'Failed to send.' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-[120px] px-[8%] bg-[var(--bg-primary)]">
      <div className="text-center mb-16">
        <h2 className="font-['Space_Grotesk'] text-[clamp(2rem,5vw,3.2rem)] font-black tracking-widest uppercase">
          GET IN <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">TOUCH</span>
        </h2>
        <span className="block w-16 h-[3px] bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] rounded-full mx-auto mt-4" />
        <p className="text-sm text-[var(--text-secondary)] mt-4">Have a project or collaboration in mind? Let's connect.</p>
      </div>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="font-['Space_Grotesk'] text-[2.4rem] font-black text-[var(--accent-cyan)] tracking-wider mb-4" style={{ textShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
            Let's Talk
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
            Have a project idea, collaboration, or just want to say hello? Fill out the form and I will get back to you!
          </p>
          {[
            { icon: 'fas fa-map-marker-alt', label: 'Location', val: 'Meerut, Uttar Pradesh, India' },
            { icon: 'fas fa-phone', label: 'Phone', val: '+91 825 233 6811' },
            { icon: 'fas fa-envelope', label: 'Email', val: 'deskamp33@gmail.com' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] mb-4 transition-all hover:border-[var(--border-hover)] hover:translate-x-1">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-glow)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
                <i className={item.icon} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{item.label}</p>
                <p className="text-sm text-[var(--text-primary)]">{item.val}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)]" />
          <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-wider mb-7">Send a Message</h3>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-5 transition-all focus:border-[var(--accent-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Your Email" required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-5 transition-all focus:border-[var(--accent-cyan)]" />
          <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-5 transition-all focus:border-[var(--accent-cyan)]" />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" required rows={5}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none mb-5 transition-all focus:border-[var(--accent-cyan)] resize-none" />
          <button type="submit" disabled={sending}
            className="w-full font-['Inter'] text-sm font-semibold tracking-widest uppercase py-4 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,212,255,0.4)] disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          {status && (
            <p className={`text-center text-sm mt-3 font-medium ${status.type === 'success' ? 'text-[var(--accent-cyan)]' : 'text-red-400'}`}>
              {status.text}
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
