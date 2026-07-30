import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useRef, useState, useCallback } from 'react';
import api from '../../lib/api';
import { Iframe } from '../../extensions/Iframe';
import { Video as VideoExt } from '../../extensions/Video';

const lowlight = createLowlight(common);

type EditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder = 'Write your article content here...' }: EditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageDialog, setImageDialog] = useState<{ open: boolean; uploading: boolean; url: string }>({ open: false, uploading: false, url: '' });
  const [imageWidth, setImageWidth] = useState('');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('center');
  const [videoDialog, setVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph', 'codeBlock', 'blockquote', 'listItem', 'table'] }),
      Link.configure({ openOnClick: false }),
      ImageExt,
      Table.configure({ resizable: true, renderWrapper: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
      Iframe.configure({ allowFullscreen: true }),
      VideoExt,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[350px] px-5 py-4 text-sm leading-relaxed',
      },
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImageDialog({ open: true, uploading: true, url: '' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/upload', fd);
      if (res.data.success) {
        setImageDialog({ open: true, uploading: false, url: res.data.url });
      } else {
        alert('Image upload failed');
        setImageDialog({ open: false, uploading: false, url: '' });
      }
    } catch {
      alert('Image upload failed');
      setImageDialog({ open: false, uploading: false, url: '' });
    }
    if (e.target) e.target.value = '';
  };

  const insertImageWithOptions = () => {
    if (!editor || !imageDialog.url) return;
    const w = imageWidth ? parseInt(imageWidth) : null;
    const style = imageAlign === 'center' ? 'display:block;margin:0 auto' : imageAlign === 'right' ? 'display:block;margin-left:auto' : '';
    const widthAttr = w ? ` width="${w}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';
    const html = `<img src="${imageDialog.url}"${widthAttr}${styleAttr} />`;
    setImageDialog({ open: false, uploading: false, url: '' });
    setImageWidth('');
    setImageAlign('center');
    requestAnimationFrame(() => {
      if (!editor) return;
      editor.commands.focus();
      editor.commands.insertContent(html);
    });
  };

  const handleVideoEmbed = () => {
    if (!editor || !videoUrl) return;
    const trimmed = videoUrl.trim();
    let html = '';
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (ytMatch) {
      html = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    } else if (vimeoMatch) {
      html = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    } else {
      html = `<video src="${trimmed}" controls style="max-width:100%;border-radius:8px"></video>`;
    }
    setVideoDialog(false);
    setVideoUrl('');
    requestAnimationFrame(() => {
      if (!editor) return;
      editor.commands.focus();
      editor.commands.insertContent(html);
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/upload', fd);
      if (res.data.success) {
        const html = `<video src="${res.data.url}" controls style="max-width:100%;border-radius:8px"></video>`;
        setVideoUploading(false);
        setVideoDialog(false);
        requestAnimationFrame(() => {
          if (!editor) return;
          editor.commands.focus();
          editor.commands.insertContent(html);
        });
        return;
      }
    } catch {
      alert('Video upload failed');
    }
    setVideoUploading(false);
    setVideoDialog(false);
    if (e.target) e.target.value = '';
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link');
    if (previous.href) {
      setLinkUrl(previous.href);
    }
    setLinkOpen(true);
  }, [editor]);

  const insertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  };

  if (!editor) return null;

  const ToolbarBtn = ({ onClick, active, title, children, disabled }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode; disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer border-none ${
        active ? 'bg-[var(--accent-cyan)] text-[#060b14]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)]'
      } disabled:opacity-30 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-[var(--border)] mx-0.5 shrink-0" />;

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-secondary)]" data-color-mode="dark">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10">
        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline"><u>U</u></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')} title="Highlight"><span style={{ background: 'var(--accent-cyan)', color: '#060b14', padding: '0 2px' }}>H</span></ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet List">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Ordered List">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><text x="2" y="9" fontSize="7" fill="currentColor" fontWeight="bold">1</text><text x="2" y="15" fontSize="7" fill="currentColor" fontWeight="bold">2</text><text x="2" y="21" fontSize="7" fill="currentColor" fontWeight="bold">3</text></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')} title="Task List">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-5" strokeWidth="2"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Block elements */}
        <ToolbarBtn onClick={() => setTableDialog(true)} title="Insert Table">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')} title="Code Block">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Blockquote">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Media */}
        <ToolbarBtn onClick={() => fileRef.current?.click()} title="Upload Image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setVideoDialog(true)} title="Insert Video">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={openLinkDialog} active={editor.isActive('link')} title="Insert Link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} className="editor-content" />

      {/* Hidden file input for image upload */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />

      {/* Image Upload Dialog */}
      {imageDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={() => { if (!imageDialog.uploading) setImageDialog({ open: false, uploading: false, url: '' }); }}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[420px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {imageDialog.uploading ? (
              <>
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-10 h-10 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)]">Uploading image...</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Please wait while your image is being uploaded.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)]">Image Options</h3>
                  <button onClick={() => setImageDialog({ open: false, uploading: false, url: '' })}
                    className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] bg-transparent border-none cursor-pointer text-lg">&times;</button>
                </div>
                {imageDialog.url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
                    <img src={imageDialog.url} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Width (px)</label>
                  <input value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} placeholder="Auto (leave empty)" type="number" min="0"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Alignment</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} onClick={() => setImageAlign(a)}
                        className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg border cursor-pointer transition-all ${
                          imageAlign === a
                            ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] border-transparent'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--accent-cyan)]'
                        }`}>
                        {a === 'left' ? 'Left' : a === 'center' ? 'Center' : 'Right'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={insertImageWithOptions}
                    className="flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
                    Insert Image
                  </button>
                  <button onClick={() => setImageDialog({ open: false, uploading: false, url: '' })}
                    className="text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {videoDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={() => { if (!videoUploading) setVideoDialog(false); }}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[480px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {videoUploading ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-10 h-10 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-secondary)]">Uploading video...</p>
                <p className="text-[0.7rem] text-[var(--text-muted)]">Please wait while your video is being uploaded.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)]">Insert Video</h3>
                  <button onClick={() => setVideoDialog(false)} className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] bg-transparent border-none cursor-pointer text-lg">&times;</button>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">YouTube / Vimeo URL</label>
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none mb-3 focus:border-[var(--accent-cyan)]" />
                  <button onClick={handleVideoEmbed} disabled={!videoUrl}
                    className="text-xs font-bold uppercase tracking-wider py-2 px-4 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50">
                    Embed
                  </button>
                </div>
                <div className="border-t border-[var(--border)] pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Or upload video file</label>
                  <input ref={videoFileRef} type="file" accept="video/*" onChange={handleVideoUpload}
                    disabled={videoUploading}
                    className="w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-none file:text-xs file:font-semibold file:bg-[var(--accent-glow)] file:text-[var(--accent-cyan)]" />
                  {videoUploading && <p className="text-xs text-[var(--accent-cyan)] mt-2">Uploading...</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {tableDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={() => setTableDialog(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[360px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">Insert Table</h3>
            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Rows</label>
                <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Columns</label>
                <input type="number" min={1} max={20} value={tableCols} onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={insertTable}
                className="flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
                Insert
              </button>
              <button onClick={() => setTableDialog(false)}
                className="text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {linkOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={() => setLinkOpen(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-[400px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[var(--text-primary)] mb-4">
              {editor.getAttributes('link').href ? 'Edit Link' : 'Insert Link'}
            </h3>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none mb-4 focus:border-[var(--accent-cyan)]" />
            <div className="flex gap-3">
              <button onClick={setLink}
                className="flex-1 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-0.5">
                {editor.getAttributes('link').href ? 'Update' : 'Insert'}
              </button>
              {editor.getAttributes('link').href && (
                <button onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}
                  className="text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-red-500 text-red-400 bg-transparent cursor-pointer transition-all hover:bg-red-500/10">
                  Remove
                </button>
              )}
              <button onClick={() => setLinkOpen(false)}
                className="text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}