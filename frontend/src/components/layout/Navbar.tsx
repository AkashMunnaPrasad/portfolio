import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import signature from '../../assets/signature.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/resume', label: 'Resume' },
  { to: '/projects', label: 'Projects' },

  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHome
          ? 'bg-transparent'
          : scrolled
            ? 'bg-[var(--bg-glass)] backdrop-blur-xl shadow-[var(--shadow-glow)] border-b border-[var(--border)]'
            : 'bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between h-[72px] px-[5%] max-w-[1400px] mx-auto">
        <Link to="/" className="flex items-center">
          <img src={signature} alt="Akash Munna Prasad" className="h-9 w-auto object-contain brightness-0 invert" />
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`group text-sm font-medium tracking-widest uppercase no-underline py-1 relative transition-all duration-300
                  ${pathname === l.to ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'}
                `}
              >
                {l.label}
                <span className={`absolute bottom-[-2px] left-0 h-[2px] bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] rounded-full transition-all duration-300 ${pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-[var(--accent-cyan)] p-1.5 border border-[var(--border)] rounded cursor-pointer hover:bg-[var(--accent-glow)] transition-all"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div
        className={`fixed top-[72px] right-0 w-[260px] h-screen bg-[var(--bg-glass)] backdrop-blur-xl border-l border-[var(--border)] p-8 flex flex-col gap-6 transition-transform duration-400 z-40 md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setOpen(false)}
            className={`text-sm font-medium tracking-widest uppercase no-underline transition-all ${pathname === l.to ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
