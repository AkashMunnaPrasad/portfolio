import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/newsletter', { email });
      if (res.data.success) {
        setSubMsg('Subscribed!');
        setEmail('');
      } else {
        setSubMsg(res.data.message || 'Failed');
      }
    } catch {
      setSubMsg('Error. Try again.');
    }
    setTimeout(() => setSubMsg(''), 4000);
  };

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] pt-16 pb-0">
      <div className="max-w-[1200px] mx-auto px-[5%] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 mb-12">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xs font-bold tracking-widest uppercase text-[var(--accent-cyan)] mb-5">
            Useful Links
          </h3>
          <ul className="list-none flex flex-col gap-3">
            {['About', 'Projects', 'Skills', 'Contact'].map((l) => (
              <li key={l}>
                <Link to={`/${l.toLowerCase()}`} className="text-sm text-[var(--text-secondary)] no-underline transition-all hover:text-[var(--accent-cyan)] hover:pl-1">
                  <span className="text-[var(--accent-cyan)] mr-1.5">›</span>{l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-['Space_Grotesk'] text-xs font-bold tracking-widest uppercase text-[var(--accent-cyan)] mb-5">
            Newsletter
          </h3>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              required
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent-cyan)]"
            />
            <button
              type="submit"
              className="text-xs font-semibold tracking-widest uppercase py-3 px-4 border-none rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:opacity-85 hover:-translate-y-0.5"
            >
              Subscribe
            </button>
            {subMsg && <p className="text-xs text-[var(--accent-cyan)]">{subMsg}</p>}
          </form>
        </div>

        <div>
          <h3 className="font-['Space_Grotesk'] text-xs font-bold tracking-widest uppercase text-[var(--accent-cyan)] mb-5">
            Connect With Me
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Meerut, Uttar Pradesh, India<br />
            deskamp33@gmail.com
          </p>
          <div className="flex gap-3 mt-4">
            {[
              { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/akash-munna-prasad-14014533a/' },
              { icon: 'fab fa-github', href: 'https://github.com/AkashMunnaPrasad' },
              { icon: 'fas fa-envelope', href: 'mailto:deskamp33@gmail.com' },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[42px] h-[42px] flex items-center justify-center rounded border border-[var(--border)] text-[var(--text-secondary)] no-underline bg-[var(--bg-card)] transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] hover:-translate-y-1"
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)] tracking-wider">
        &copy; 2026 Akash Munna Prasad. All Rights Reserved.
      </div>
    </footer>
  );
}
