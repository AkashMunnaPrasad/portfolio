import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/api';
import type { ProjectCardData } from '../../types';

interface ProjectCardProps {
  project: ProjectCardData;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const imgSrc = getImageUrl(project.image_url) || `https://placehold.co/400x220/0f1a2e/00d4ff?text=${encodeURIComponent(project.title.slice(0, 20))}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col transition-all duration-400 cursor-default relative group hover:border-[rgba(0,212,255,0.5)] hover:-translate-y-2.5 hover:shadow-[0_24px_70px_rgba(0,0,0,0.55),0_0_40px_rgba(0,212,255,0.18)]"
    >
      <div className="h-[180px] overflow-hidden relative shrink-0">
        <img
          src={imgSrc}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(6,11,20,0.85)] pointer-events-none" />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="text-[0.66rem] font-bold tracking-widest uppercase px-3 py-1 bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.4)] rounded-full text-[var(--accent-cyan)] backdrop-blur-md">
            {project.category}
          </span>
          {project.featured && (
            <span className="text-[0.66rem] font-bold px-3 py-1 bg-[rgba(255,200,0,0.2)] border border-[rgba(255,200,0,0.4)] rounded-full text-yellow-400 backdrop-blur-md">
              ★ Featured
            </span>
          )}
        </div>

      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10">
        <h3 className="font-['Space_Grotesk'] text-sm font-extrabold uppercase tracking-wider leading-tight text-[var(--text-primary)] mb-3">
          {project.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 flex-1 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[0.64rem] font-bold px-2.5 py-0.5 bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.25)] rounded-full tracking-wider uppercase">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-auto">
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded text-[var(--text-secondary)] no-underline shrink-0 transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-glow)]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          )}
          <Link to={`/projects/${project.slug}`}
            className="flex-1 font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-3.5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[var(--bg-primary)] cursor-pointer no-underline text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,212,255,0.4)]">
            Know More
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none z-0 opacity-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.12),transparent_65%)] transition-opacity duration-400 group-hover:opacity-100" />
    </motion.article>
  );
}
