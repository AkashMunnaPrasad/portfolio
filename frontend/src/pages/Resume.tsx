import { motion } from 'framer-motion';
import PageHero from '../components/ui/PageHero';
import { useApi } from '../hooks/useApi';
import type { Experience, Education, Skill } from '../types';

export default function Resume() {
  const { data: experiences } = useApi<Experience[]>('/experience');
  const { data: education } = useApi<Education[]>('/education');
  const { data: skills } = useApi<Skill[]>('/skills');

  return (
    <>
      <PageHero title="RESUME" subtitle="Experience & Qualifications" />

      <section className="py-8 px-[8%] bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto flex justify-center gap-16 p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] flex-wrap">
          {[
            { label: 'Experience', val: experiences?.length || 0 },
            { label: 'Education', val: education?.length || 0 },
            { label: 'Skills', val: skills?.length || 0 },
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

      <section className="py-20 px-[8%] bg-[var(--bg-primary)]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-black tracking-wider uppercase mb-8 flex items-center gap-3">
              <i className="fas fa-briefcase text-[var(--accent-cyan)]" />
              <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">Experience</span>
            </h2>
            <div className="space-y-6">
              {experiences?.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 relative group hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-glow)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)]">{exp.title}</h3>
                      <p className="text-sm text-[var(--accent-violet)] font-medium mt-1">
                        <i className="fas fa-building mr-1.5" />{exp.organization}
                      </p>
                    </div>
                    <span className="text-[0.66rem] font-bold tracking-widest uppercase text-[var(--accent-cyan)] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-full px-3 py-0.5 whitespace-nowrap">
                      {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-[var(--text-muted)] mb-2"><i className="fas fa-map-marker-alt mr-1" />{exp.location}</p>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{exp.description}</p>
                  {exp.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.tags.map((t) => (
                        <span key={t} className="text-[0.64rem] font-bold px-2 py-0.5 bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.25)] rounded-full tracking-wider uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {(!experiences || experiences.length === 0) && (
                <p className="text-[var(--text-muted)] text-sm">No experience entries yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-black tracking-wider uppercase mb-8 flex items-center gap-3">
              <i className="fas fa-graduation-cap text-[var(--accent-cyan)]" />
              <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">Education</span>
            </h2>
            <div className="space-y-6">
              {education?.map((edu, i) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 relative group hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-glow)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)]">{edu.degree}</h3>
                      <p className="text-sm text-[var(--accent-violet)] font-medium mt-1">
                        <i className="fas fa-university mr-1.5" />{edu.institution}
                      </p>
                    </div>
                    <span className="text-[0.66rem] font-bold tracking-widest uppercase text-[var(--accent-cyan)] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-full px-3 py-0.5 whitespace-nowrap">
                      {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                    </span>
                  </div>
                  {edu.location && (
                    <p className="text-xs text-[var(--text-muted)] mb-2"><i className="fas fa-map-marker-alt mr-1" />{edu.location}</p>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{edu.description}</p>
                </motion.div>
              ))}
              {(!education || education.length === 0) && (
                <p className="text-[var(--text-muted)] text-sm">No education entries yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-[8%] bg-[var(--bg-secondary)] text-center">
        <h2 className="font-['Space_Grotesk'] text-xl font-black tracking-wider uppercase mb-8">
          Download My <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">Resume</span>
        </h2>
        <a
          href="/resume.pdf"
          download
          className="inline-flex items-center gap-3 font-['Inter'] text-sm font-semibold tracking-widest uppercase py-4 px-10 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer no-underline transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,212,255,0.4)]"
        >
          <i className="fas fa-download" />
          Download CV
        </a>
      </section>
    </>
  );
}
