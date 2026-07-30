import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import ProjectCard from './ProjectCard';
import type { ProjectCardData } from '../../types';

export default function ProjectsSection() {
  const { data: projects } = useApi<ProjectCardData[]>('/projects/featured');

  return (
    <section className="py-[140px] px-[8%] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] via-[var(--accent-violet)] to-transparent" />

      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-['Space_Grotesk'] text-[clamp(2.4rem,6vw,4rem)] font-black tracking-widest uppercase bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">
            FEATURED PROJECTS
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-[580px] mx-auto mt-5 leading-relaxed">
            A selection of my best work across VLSI design, web development, IoT, and signal processing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(projects || []).slice(0, 6).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/projects"
            className="inline-block font-['Inter'] text-xs font-bold uppercase tracking-widest py-3.5 px-10 rounded-full border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] no-underline cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,212,255,0.4)]">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
