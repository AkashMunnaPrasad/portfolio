import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageHero from '../components/ui/PageHero';
import { useApi } from '../hooks/useApi';
import type { Skill } from '../types';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'tools', label: 'Tools & Other' },
  { key: 'vlsi', label: 'VLSI' },
];

const tools = [
  { icon: 'fab fa-git-alt', name: 'Git' },
  { icon: 'fab fa-github', name: 'GitHub' },
  { icon: 'fab fa-linux', name: 'Linux' },
  { icon: 'fab fa-docker', name: 'Docker' },
  { icon: 'fas fa-terminal', name: 'Bash' },
  { icon: 'fas fa-database', name: 'PostgreSQL' },
  { icon: 'fas fa-cloud', name: 'Supabase' },
  { icon: 'fas fa-server', name: 'Railway' },
  { icon: 'fab fa-figma', name: 'Figma' },
  { icon: 'fas fa-chart-line', name: 'MATLAB' },
];

export default function Skills() {
  const [filter, setFilter] = useState('all');
  const { data: skills } = useApi<Skill[]>('/skills');

  const filtered = skills
    ? filter === 'all'
      ? skills
      : skills.filter((s) => s.category === filter)
    : [];

  const categoriesData = skills
    ? [...new Set(skills.map((s) => s.category))]
    : [];

  return (
    <>
      <PageHero title="SKILLS" subtitle="Technologies & Tools I Work With" />

      <section className="py-8 px-[8%] bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto flex justify-center gap-16 p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] flex-wrap">
          {[
            { label: 'Skills', val: skills?.length || 0 },
            { label: 'Categories', val: categoriesData.length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-['Space_Grotesk'] text-[2.6rem] font-black text-[var(--accent-cyan)] leading-none" style={{ textShadow: '0 0 20px var(--accent-cyan)' }}>
                {s.val}<span className="text-xl text-[var(--accent-violet)]">+</span>
              </p>
              <p className="text-[0.72rem] tracking-widest uppercase text-[var(--text-muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-[8%] bg-[var(--bg-secondary)] relative overflow-hidden">
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`font-['Inter'] text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded-full border cursor-pointer transition-all duration-300 ${
                filter === c.key
                  ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent shadow-[0_4px_20px_rgba(0,212,255,0.3)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 max-w-[1100px] mx-auto">
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <section className="py-24 px-[8%] bg-[var(--bg-primary)]">
        <div className="text-center mb-14">
          <h2 className="font-['Space_Grotesk'] text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-wider uppercase">
            TOOLS & <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">PLATFORMS</span>
          </h2>
        </div>
        <div className="max-w-[1200px] mx-auto flex flex-wrap gap-4 justify-center">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-sm font-semibold text-[var(--text-secondary)] tracking-wider cursor-default transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,212,255,0.18)]"
            >
              <i className={`${tool.icon} text-sm text-[var(--accent-cyan)]`} />
              {tool.name}
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let c = 0;
    const step = Math.max(1, Math.ceil(skill.percent / 50));
    const timer = setInterval(() => {
      c = Math.min(c + step, skill.percent);
      setCount(c);
      if (c >= skill.percent) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [visible, skill.percent]);

  return (
    <div
      ref={ref}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 cursor-default transition-all duration-300 hover:border-[var(--border-hover)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-glow)] relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl text-[var(--accent-cyan)]" style={{ textShadow: '0 0 16px var(--accent-cyan)' }}>
          <i className={skill.icon || 'fas fa-code'} />
        </span>
        <span className="font-['Space_Grotesk'] text-xl font-bold text-[var(--text-primary)]">
          {count}<span className="text-sm text-[var(--text-muted)]">%</span>
        </span>
      </div>
      <p className="font-semibold text-sm tracking-wider mb-3 text-[var(--text-primary)]">{skill.name}</p>
      <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] transition-all duration-[2s] ease-out shadow-[0_0_8px_var(--accent-cyan)]"
          style={{ width: visible ? `${skill.percent}%` : '0%' }}
        />
      </div>
      <p className="text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)]">{skill.level}</p>
    </div>
  );
}
