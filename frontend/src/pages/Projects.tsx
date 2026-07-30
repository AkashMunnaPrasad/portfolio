import { useState, useEffect, useRef, useCallback } from 'react';
import PageHero from '../components/ui/PageHero';
import ProjectCard from '../components/sections/ProjectCard';
import api from '../lib/api';
import type { ProjectCardData } from '../types';

interface StatsData {
  total: number;
  categories: { name: string; count: number }[];
  featured: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const categories = [
    'all',
    ...Array.from(new Map((stats?.categories || []).map((c) => [c.name.toLowerCase(), c.name])).values()),
  ];

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/projects/stats');
        if (res.data.success) setStats(res.data.stats);
      } catch {}
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: String(limit),
          sort,
          order: 'desc',
        };
        if (filter !== 'all') params.category = filter;
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await api.get('/projects', { params });
        if (res.data.success) {
          setProjects(res.data.projects);
          setTotal(res.data.total || res.data.count);
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [filter, debouncedSearch, sort, page]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <PageHero title="PROJECTS" subtitle="Things I've Built & Designed" />

      <section className="py-8 px-[8%] bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto flex justify-center gap-16 p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] flex-wrap">
          <div className="text-center">
            <p className="font-['Space_Grotesk'] text-[2.6rem] font-black text-[var(--accent-cyan)] leading-none" style={{ textShadow: '0 0 20px var(--accent-cyan)' }}>
              {stats?.total || 0}<span className="text-xl text-[var(--accent-violet)]">+</span>
            </p>
            <p className="text-[0.72rem] tracking-widest uppercase text-[var(--text-muted)] mt-1">Total Projects</p>
          </div>
          <div className="text-center">
            <p className="font-['Space_Grotesk'] text-[2.6rem] font-black text-[var(--accent-cyan)] leading-none" style={{ textShadow: '0 0 20px var(--accent-cyan)' }}>
              {stats?.categories.length || 0}<span className="text-xl text-[var(--accent-violet)]">+</span>
            </p>
            <p className="text-[0.72rem] tracking-widest uppercase text-[var(--text-muted)] mt-1">Categories</p>
          </div>
          <div className="text-center">
            <p className="font-['Space_Grotesk'] text-[2.6rem] font-black text-[var(--accent-cyan)] leading-none" style={{ textShadow: '0 0 20px var(--accent-cyan)' }}>
              {stats?.featured || 0}<span className="text-xl text-[var(--accent-violet)]">+</span>
            </p>
            <p className="text-[0.72rem] tracking-widest uppercase text-[var(--text-muted)] mt-1">Featured</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-[8%] bg-[var(--bg-secondary)] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex gap-3 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => { setFilter(c); setPage(1); }}
                  className={`font-['Inter'] text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded-full border cursor-pointer transition-all duration-300 ${
                    filter === c
                      ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent shadow-[0_4px_20px_rgba(0,212,255,0.3)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-gradient-to-r hover:from-[var(--accent-cyan)] hover:to-[var(--accent-violet)] hover:text-[#060b14] hover:border-transparent'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search projects..."
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-2.5 pl-10 text-xs text-[var(--text-primary)] outline-none w-[200px] focus:border-[var(--accent-cyan)]"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] cursor-pointer"
              >
                <option value="created_at">Newest First</option>
                <option value="title">Alphabetical</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[var(--text-muted)] mb-3">No projects found matching your criteria.</p>
                  <button onClick={() => { setSearch(''); setDebouncedSearch(''); setFilter('all'); setPage(1); }}
                    className="text-xs text-[var(--accent-cyan)] bg-transparent border border-[var(--accent-cyan)] rounded-full px-6 py-2 cursor-pointer hover:bg-[var(--accent-glow)] transition-all">
                    Clear Filters
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-14">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="font-['Inter'] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all"
                  >
                    ← Prev
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded text-xs font-bold transition-all cursor-pointer ${
                          p === page
                            ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-none'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="font-['Inter'] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
