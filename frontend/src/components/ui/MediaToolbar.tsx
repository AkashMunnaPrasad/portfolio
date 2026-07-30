import { useRef, useState } from 'react';
import api from '../../lib/api';

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

interface MediaToolbarProps {
  onInsert: (html: string) => void;
}

/* ── Image Upload with size/alignment dialog ── */

type Align = 'left' | 'center' | 'right';

export function ImageUploadButton({ onInsert }: MediaToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState<{ url: string; name: string } | null>(null);
  const [width, setWidth] = useState('');
  const [align, setAlign] = useState<Align>('center');

  const handleClick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/upload', fd);
      if (res.data.success) {
        setDialog({ url: res.data.url, name: file.name });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleInsert = () => {
    if (!dialog) return;
    const w = width ? parseInt(width) : 0;
    const widthAttr = w > 0 ? ` width="${w}"` : '';
    const style = align === 'center' ? ' style="display:block;margin:0 auto"' : align === 'right' ? ' style="display:block;margin-left:auto"' : '';
    const html = `\n<img src="${dialog.url}" alt="${dialog.name}"${widthAttr}${style} />\n`;
    onInsert(html);
    setDialog(null);
    setWidth('');
    setAlign('center');
  };

  const handleCancel = () => {
    setDialog(null);
    setWidth('');
    setAlign('center');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        title="Upload Image"
        className="inline-flex items-center justify-center w-8 h-8 rounded text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] transition-all cursor-pointer border-none bg-transparent disabled:opacity-50"
      >
        {uploading ? <span className="w-3.5 h-3.5 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" /> : <UploadIcon />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} hidden />

      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={handleCancel}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[420px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Image Options</h3>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Width (px)</label>
              <input value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Auto (leave empty)" type="number" min="0"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Alignment</label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as Align[]).map((a) => (
                  <button key={a} onClick={() => setAlign(a)}
                    className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg border cursor-pointer transition-all ${
                      align === a
                        ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--accent-cyan)]'
                    }`}>
                    {a === 'left' ? 'Left' : a === 'center' ? 'Center' : 'Right'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleInsert}
                className="flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
                Insert
              </button>
              <button onClick={handleCancel}
                className="text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Video Embed / Upload ── */

export function VideoEmbedButton({ onInsert }: MediaToolbarProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'embed' | 'upload'>('embed');
  const [embedUrl, setEmbedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const getEmbedHtml = (url: string): string | null => {
    const trimmed = url.trim();

    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const ytMatch = trimmed.match(ytRegex);
    if (ytMatch) {
      return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    }

    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = trimmed.match(vimeoRegex);
    if (vimeoMatch) {
      return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    }

    return null;
  };

  const handleEmbed = () => {
    const html = getEmbedHtml(embedUrl);
    if (html) {
      onInsert(`\n${html}\n`);
    } else {
      onInsert(`\n<video src="${embedUrl}" controls style="max-width:100%"></video>\n`);
    }
    setOpen(false);
    setEmbedUrl('');
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/upload', fd);
      if (res.data.success) {
        onInsert(`\n<video src="${res.data.url}" controls style="max-width:100%"></video>\n`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
    setOpen(false);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Insert Video"
        className="inline-flex items-center justify-center w-8 h-8 rounded text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] transition-all cursor-pointer border-none bg-transparent"
      >
        <VideoIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={() => setOpen(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[480px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)]">Insert Video</h3>
              <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] bg-transparent border-none cursor-pointer text-lg">&times;</button>
            </div>

            <div className="flex gap-2 mb-5">
              <button onClick={() => setTab('embed')}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border cursor-pointer transition-all ${tab === 'embed' ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--accent-cyan)]'}`}>
                Link / Embed
              </button>
              <button onClick={() => setTab('upload')}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border cursor-pointer transition-all ${tab === 'upload' ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--accent-cyan)]'}`}>
                Upload Video
              </button>
            </div>

            {tab === 'embed' ? (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-3">Paste a YouTube, Vimeo URL or direct video link</p>
                <div className="mb-3 rounded overflow-hidden border border-[var(--border)]">
                  <img src="https://placehold.co/600x80/0f1a2e/4a6080?text=Supports:+youtube.com,+youtu.be,+vimeo.com" alt="supported platforms" className="w-full" />
                </div>
                <input
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none mb-4 focus:border-[var(--accent-cyan)]"
                />
                <button onClick={handleEmbed} disabled={!embedUrl}
                  className="text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50">
                  Insert
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-3">Upload a video file (MP4, WebM, etc.)</p>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload}
                  disabled={uploading}
                  className="w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-none file:text-xs file:font-semibold file:bg-[var(--accent-glow)] file:text-[var(--accent-cyan)]" />
                {uploading && <p className="text-xs text-[var(--accent-cyan)] mt-2">Uploading...</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
