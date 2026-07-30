import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import type { Skill } from '../../types';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'tools', label: 'Tools & Other' },
  { key: 'vlsi', label: 'VLSI' },
];

export default function SkillsSection() {
  const [filter, setFilter] = useState('all');
  const { data: skills } = useApi<Skill[]>('/skills');

  const filtered = skills
    ? filter === 'all'
      ? skills
      : skills.filter((s) => s.category === filter)
    : [];

  return (
    <section className="py-[120px] px-[8%] bg-[var(--bg-primary)] relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] top-[-100px] right-[-100px] rounded-full bg-[var(--accent-violet)] blur-[100px] opacity-[0.18] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bottom-[-100px] left-[-60px] rounded-full bg-[var(--accent-cyan)] blur-[100px] opacity-[0.18] pointer-events-none" />

      <div className="text-center mb-10">
        <h2 className="font-['Space_Grotesk'] text-[clamp(2rem,5vw,3.2rem)] font-black tracking-widest uppercase">
          MY <span className="text-[var(--accent-cyan)]">SKILLS</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2">Technologies I work with</p>
      </div>

      <div className="flex justify-center gap-3 mb-12 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`font-['Inter'] text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded-full border cursor-pointer transition-all duration-300 ${
              filter === c.key
                ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent shadow-[0_4px_20px_rgba(0,212,255,0.3)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-gradient-to-r hover:from-[var(--accent-cyan)] hover:to-[var(--accent-violet)] hover:text-[#060b14] hover:border-transparent'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 max-w-[1100px] mx-auto">
        {filtered.map((skill, i) => (
          <SkillCard key={skill.id} skill={skill} index={i} />
        ))}
      </div>
    </section>
  );
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
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

  const level = skill.percent >= 90 ? 'S' : skill.percent >= 80 ? 'A' : skill.percent >= 65 ? 'B' : skill.percent >= 50 ? 'C' : 'D';
  const levelColor = level === 'S' ? 'text-yellow-400' : level === 'A' ? 'text-green-400' : level === 'B' ? 'text-[var(--accent-cyan)]' : level === 'C' ? 'text-violet-400' : 'text-[var(--text-muted)]';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="game-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 cursor-default transition-all duration-300 hover:border-[var(--border-hover)] hover:-translate-y-2 hover:shadow-[var(--shadow-glow)] relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl text-[var(--accent-cyan)]" style={{ textShadow: '0 0 16px var(--accent-cyan)' }}>
          <i className={`${skill.icon || 'fas fa-code'}`} />
        </span>
        <span className={`font-['Space_Grotesk'] text-sm font-bold ${levelColor} px-2 py-0.5 border border-current rounded`}>
          LV.{level}
        </span>
      </div>
      <p className="font-semibold text-sm tracking-wider mb-3 text-[var(--text-primary)]">{skill.name}</p>
      <div className="relative mb-2">
        <div className="h-2.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.04)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] transition-all duration-[2s] ease-out shadow-[0_0_12px_var(--accent-cyan)] relative"
            style={{ width: visible ? `${skill.percent}%` : '0%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
          </div>
        </div>
        <div className="absolute -top-1 right-0 flex items-center gap-1">
          <span className="text-[0.6rem] font-bold text-[var(--text-primary)]">{count}</span>
          <span className="text-[0.55rem] text-[var(--text-muted)]">XP</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)]">{skill.level || 'active'}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < Math.ceil(skill.percent / 20)
                  ? 'bg-[var(--accent-cyan)] shadow-[0_0_6px_var(--accent-cyan)]'
                  : 'bg-[rgba(255,255,255,0.08)]'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
