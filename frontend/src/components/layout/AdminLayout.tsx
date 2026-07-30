import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'fas fa-chart-pie' },
  { to: '/admin/contacts', label: 'Contacts', icon: 'fas fa-envelope' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: 'fas fa-users' },
  { to: '/admin/projects', label: 'Projects', icon: 'fas fa-project-diagram' },

  { to: '/admin/skills', label: 'Skills', icon: 'fas fa-code' },
  { to: '/admin/experience', label: 'Experience', icon: 'fas fa-briefcase' },
  { to: '/admin/education', label: 'Education', icon: 'fas fa-graduation-cap' },
  { to: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      <aside className={`fixed top-0 left-0 h-full w-[250px] bg-[var(--bg-card)] border-r border-[var(--border)] z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-[var(--border)]">
          <Link to="/admin" className="font-['Space_Grotesk'] text-lg font-bold tracking-widest text-[var(--accent-cyan)] no-underline">
            AMP Admin
          </Link>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          {sidebarLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium tracking-wider no-underline transition-all ${
                pathname === l.to
                  ? 'bg-[var(--accent-glow)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.2)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-cyan)]'
              }`}
            >
              <i className={`${l.icon} w-5 text-center`} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-[rgba(255,0,0,0.1)] transition-all cursor-pointer border-none"
          >
            <i className="fas fa-sign-out-alt w-5 text-center" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[250px]">
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-card)]">
          <button
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors no-underline">
            ← View Site
          </Link>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
