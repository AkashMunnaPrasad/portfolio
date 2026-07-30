import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import api, { getImageUrl } from '../lib/api';
import ProjectCard from '../components/sections/ProjectCard';
import ReadingProgress from '../components/sections/ReadingProgress';
import ImageLightbox from '../components/sections/ImageLightbox';
import SocialShare from '../components/sections/SocialShare';
import QrCode from '../components/sections/QrCode';
import type { Project, ProjectImage, ProjectCardData } from '../types';

function addHeadingIds(html: string): string {
  return html.replace(/<h([1-3])(\s[^>]*)?>/gi, (match, level, attrs) => {
    const textMatch = match.replace(/<[^>]+>/g, '').trim();
    const existingId = attrs?.match(/id="([^"]+)"/i);
    if (existingId) return match;
    const id = textMatch
      ? textMatch.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
      : `heading-${Math.random().toString(36).slice(2, 7)}`;
    return `<h${level}${attrs || ''} id="${id}">`;
  });
}

function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([1-3])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }
  return items;
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [related, setRelated] = useState<ProjectCardData[]>([]);
  const [activeHeading, setActiveHeading] = useState('');

  const fetch = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await api.get(`/projects/${slug}`);
      if (res.data.success) {
        const p = res.data.project as Project;
        setProject(p);
        if (p.image_url) setSelectedImage(getImageUrl(p.image_url));
        setLoading(false);
        api.get('/projects', {
          params: { category: p.category, limit: 4, sort: 'created_at', order: 'desc' },
        }).then((relatedRes) => {
          if (relatedRes.data.success) {
            setRelated(relatedRes.data.projects.filter((r: ProjectCardData) => r.id !== p.id).slice(0, 3));
          }
        }).catch(() => {});
      } else {
        setError('Project not found');
        setLoading(false);
      }
    } catch {
      setError('Failed to load project');
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetch(); }, [fetch]);

  const sanitizedContent = useMemo(() => {
    if (!project?.content && !project?.description) return '';
    const raw = project.content || project.description;
    const clean = DOMPurify.sanitize(raw, {
      ADD_TAGS: ['iframe', 'video'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'allow', 'controls'],
    });
    return addHeadingIds(clean);
  }, [project]);

  const readingTime = useMemo(() => getReadingTime(sanitizedContent), [sanitizedContent]);

  const toc = useMemo(() => extractToc(sanitizedContent), [sanitizedContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );
    const headings = document.querySelectorAll('.prose-content h1, .prose-content h2, .prose-content h3');
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sanitizedContent]);

  const allImages = useMemo(() => {
    if (!project) return [];
    return [
      ...(project.image_url ? [{ id: 'cover', image_url: project.image_url, alt_text: project.title, sort_order: -1 } as ProjectImage] : []),
      ...(project.images || []),
    ].sort((a, b) => a.sort_order - b.sort_order);
  }, [project]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] gap-6">
        <div className="text-6xl font-black text-[var(--text-muted)]">404</div>
        <p className="text-[var(--text-secondary)]">{error || 'Project not found'}</p>
        <Link to="/projects"
          className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] no-underline transition-all hover:-translate-y-0.5">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <ReadingProgress />
      <QrCode url={window.location.href} title={project.title} />

      <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
        {project.image_url ? (
          <img src={getImageUrl(project.image_url)} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[rgba(6,11,20,0.6)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-[8%] pb-12">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex gap-3 mb-4 flex-wrap items-center">
              <span className="text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1.5 bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.4)] rounded-full text-[var(--accent-cyan)] backdrop-blur-md">
                {project.category}
              </span>
              {project.featured && (
                <span className="text-[0.7rem] font-bold px-3 py-1.5 bg-[rgba(255,200,0,0.2)] border border-[rgba(255,200,0,0.4)] rounded-full text-yellow-400 backdrop-blur-md">
                  ★ Featured
                </span>
              )}
              <span className="text-[0.7rem] text-[var(--text-muted)]">
                {readingTime} min read
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-[clamp(2rem,5vw,4rem)] font-black tracking-widest uppercase text-[var(--text-primary)] leading-tight">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-[8%] pb-20 -mt-2">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-4">
              <Link to="/projects"
                className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] no-underline transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]">
                ← Back
              </Link>
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,212,255,0.4)]">
                  Live Demo
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                  className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] no-underline transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  Source Code
                </a>
              )}
            </div>
            <SocialShare url={window.location.href} title={project.title} />
          </div>

          {allImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-muted)] uppercase mb-4">Gallery</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {allImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => { setSelectedImage(getImageUrl(img.image_url)); openLightbox(i); }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImage === getImageUrl(img.image_url)
                          ? 'border-[var(--accent-cyan)] shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                          : 'border-[var(--border)] hover:border-[var(--accent-cyan)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={getImageUrl(img.image_url)} alt={img.alt_text} className="w-full h-full object-cover" />
                    </button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedImage && allImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] cursor-pointer"
              onClick={() => {
                const idx = allImages.findIndex((img) => getImageUrl(img.image_url) === selectedImage);
                if (idx >= 0) openLightbox(idx);
              }}
            >
              <img
                src={selectedImage}
                alt={project.title}
                className="w-full h-auto max-h-[500px] object-contain bg-[var(--bg-secondary)]"
              />
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {project.tags?.map(tag => (
                <span key={tag} className="text-[0.65rem] font-bold px-3 py-1.5 bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.25)] rounded-full tracking-wider uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            {toc.length > 0 && (
              <aside className="hidden xl:block w-56 shrink-0">
                <div className="sticky top-8">
                  <h4 className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">On this page</h4>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-[0.7rem] leading-relaxed no-underline transition-all py-0.5 ${
                          activeHeading === item.id
                            ? 'text-[var(--accent-cyan)] font-semibold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 md:p-12">
                <div
                  className="prose-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>
            </motion.div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-[var(--text-muted)]">
                Published {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {project.updated_at !== project.created_at && ` · Updated ${new Date(project.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {readingTime} min read · {sanitizedContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SocialShare url={window.location.href} title={project.title} />
              <Link to="/projects"
                className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded border border-[var(--border)] text-[var(--text-secondary)] no-underline transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]">
                ← All Projects
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[var(--border)]">
              <h3 className="font-['Space_Grotesk'] text-lg font-black tracking-wider text-[var(--text-primary)] mb-2">Related Projects</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">More projects in {project.category}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          src={getImageUrl(allImages[lightboxIndex].image_url)!}
          alt={allImages[lightboxIndex].alt_text}
          onClose={() => setLightboxOpen(false)}
          onPrev={allImages.length > 1 ? () => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length) : undefined}
          onNext={allImages.length > 1 ? () => setLightboxIndex((i) => (i + 1) % allImages.length) : undefined}
        />
      )}
    </div>
  );
}
