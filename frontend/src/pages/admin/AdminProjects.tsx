import { useEffect, useState, useRef, useCallback } from 'react';
import api, { getImageUrl } from '../../lib/api';
import type { Project, ProjectImage } from '../../types';
import RichTextEditor from '../../components/editor/RichTextEditor';

const categories = ['web', 'vlsi', 'iot', 'python', 'mobile', 'ai', 'other'];

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'web', description: '', content: '', tags: '',
    live_url: '', repo_url: '', featured: false, published: false,
    image: null as File | null,
  });
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects');
      if (res.data.success) setProjects(res.data.projects);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    let result = projects;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (statusFilter === 'published') result = result.filter((p) => p.published);
    if (statusFilter === 'draft') result = result.filter((p) => !p.published);
    setFilteredProjects(result);
  }, [projects, searchQuery, statusFilter]);

  const resetForm = () => {
    setForm({ title: '', category: 'web', description: '', content: '', tags: '', live_url: '', repo_url: '', featured: false, published: false, image: null });
    setGalleryFiles([]);
    setGalleryPreview([]);
    setProjectImages([]);
    setEditing(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const openEdit = (p: Project) => {
    setForm({
      title: p.title, category: p.category, description: p.description,
      content: p.content || '', tags: p.tags?.join(', ') || '',
      live_url: p.live_url, repo_url: p.repo_url,
      featured: p.featured, published: p.published, image: null,
    });
    setGalleryFiles([]);
    setGalleryPreview([]);
    setProjectImages(p.images || []);
    setEditing(p);
    setShowForm(true);
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...galleryFiles, ...files];
    setGalleryFiles(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setGalleryPreview(previews);
  };

  const removeGalleryFile = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreview.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('content', form.content);
      fd.append('tags', form.tags);
      fd.append('live_url', form.live_url);
      fd.append('repo_url', form.repo_url);
      fd.append('featured', String(form.featured));
      fd.append('published', String(form.published));
      if (form.image) fd.append('image', form.image);
      galleryFiles.forEach(f => fd.append('gallery', f));

      if (editing) {
        await api.put(`/admin/projects/${editing.id}`, fd);
      } else {
        await api.post('/admin/projects', fd);
      }
      resetForm();
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving project');
    }
    setSaving(false);
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post(`/admin/projects/${editing.id}/images`, fd);
      if (res.data.success) {
        setProjectImages(prev => [...prev, res.data.image]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error uploading image');
    }
    setUploadingImage(false);
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!editing || !confirm('Remove this image?')) return;
    try {
      await api.delete(`/admin/projects/${editing.id}/images/${imageId}`);
      setProjectImages(prev => prev.filter(img => img.id !== imageId));
    } catch {}
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...projectImages];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setProjectImages(reordered);
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    if (!editing) return;
    try {
      await api.put(`/admin/projects/${editing.id}/images/reorder`, {
        imageIds: projectImages.map((img) => img.id),
      });
    } catch {}
  };

  const togglePublish = async (id: string) => {
    await api.patch(`/admin/projects/${id}/publish`);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;
    await api.delete(`/admin/projects/${id}`);
    fetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Space_Grotesk'] text-xl font-black tracking-wider text-[var(--text-primary)]">Projects</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
            + Add Project
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 mb-8 max-w-[900px]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)]">
              {editing ? 'Edit Project' : 'New Project'}
            </h3>
            <button type="button" onClick={resetForm}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] bg-transparent border-none cursor-pointer">
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Project Title *" required
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none col-span-2 focus:border-[var(--accent-cyan)]" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]">
              {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })}
              placeholder="Live URL"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            <input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
              placeholder="Repo URL"
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
          </div>

          <div className="mb-4">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description *" required rows={2}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] resize-none" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Article Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
              placeholder="Write your project article here... Add images, videos, tables, code blocks and more."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Cover Image</label>
              <input type="file" accept="image/*" ref={fileRef}
                onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-none file:text-xs file:font-semibold file:bg-[var(--accent-glow)] file:text-[var(--accent-cyan)]" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent-cyan)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent-cyan)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Published</span>
              </label>
            </div>
          </div>

          {editing && (
            <div className="mb-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Project Gallery Images (drag to reorder)</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {projectImages.map((img, i) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`relative group w-24 h-24 rounded overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                      dragIndex === i ? 'border-[var(--accent-cyan)] opacity-60 scale-105' : 'border-[var(--border)]'
                    }`}
                  >
                    <img src={getImageUrl(img.image_url)} alt={img.alt_text} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <span className="text-[0.5rem] text-white opacity-0 group-hover:opacity-100 transition-opacity">↕ drag</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleAddImage}
                  disabled={uploadingImage}
                  className="text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-none file:text-xs file:font-semibold file:bg-[var(--accent-glow)] file:text-[var(--accent-cyan)]" />
                {uploadingImage && <span className="text-xs text-[var(--text-muted)]">Uploading...</span>}
              </div>
            </div>
          )}

          {!editing && (
            <div className="mb-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Add Gallery Images (optional)</label>
              <input type="file" accept="image/*" multiple ref={galleryRef}
                onChange={handleGalleryAdd}
                className="w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-none file:text-xs file:font-semibold file:bg-[var(--accent-glow)] file:text-[var(--accent-cyan)]" />
              {galleryPreview.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {galleryPreview.map((preview, i) => (
                    <div key={i} className="relative group w-24 h-24 rounded overflow-hidden border border-[var(--border)]">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
            </button>
            <button type="button" onClick={resetForm}
              className="font-['Inter'] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{filteredProjects.length} / {projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          <span className="text-xs text-[var(--text-muted)]">|</span>
          <span className="text-xs text-[var(--accent-cyan)]">{projects.filter(p => p.published).length} published</span>
          <span className="text-xs text-[var(--text-muted)]">|</span>
          <span className="text-xs text-yellow-400">{projects.filter(p => p.featured).length} featured</span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none w-[180px] focus:border-[var(--accent-cyan)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] cursor-pointer"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
            {p.image_url && (
              <div className="h-36 overflow-hidden">
                <img src={getImageUrl(p.image_url)} alt={p.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] truncate">{p.title}</h3>
                <div className="flex gap-1.5 shrink-0">
                  {p.featured && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 uppercase">★</span>}
                  <span className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded uppercase ${p.published ? 'bg-[rgba(0,255,136,0.15)] text-[#00ff88]' : 'bg-[rgba(255,100,100,0.15)] text-red-400'}`}>
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">{p.category}</p>
              <p className={`text-xs text-[var(--text-secondary)] mb-1 ${expandedContent[p.id] ? '' : 'line-clamp-2'}`}>
                {p.description}
              </p>
              {p.description.length > 120 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className="text-[0.6rem] text-[var(--accent-cyan)] bg-transparent border-none cursor-pointer mb-2 hover:underline">
                  {expandedContent[p.id] ? 'Show less' : 'Show more'}
                </button>
              )}
              {p.images && p.images.length > 0 && (
                <p className="text-[0.6rem] text-[var(--text-muted)] mb-3">{p.images.length} gallery image{p.images.length !== 1 ? 's' : ''}</p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={() => togglePublish(p.id)}
                  className="text-[0.65rem] px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                  {p.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => openEdit(p)}
                  className="text-[0.65rem] px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all">
                  Edit
                </button>
                <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-[0.65rem] px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--accent-cyan)] bg-transparent no-underline cursor-pointer hover:border-[var(--accent-cyan)] transition-all">
                  View
                </a>
                <button onClick={() => remove(p.id)}
                  className="text-[0.65rem] px-2.5 py-1.5 rounded border border-[var(--border)] text-red-400 bg-transparent cursor-pointer hover:border-red-400 transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
