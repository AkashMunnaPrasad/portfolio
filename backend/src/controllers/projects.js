const supabase = require('../config/db');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const TABLE = 'projects';
const IMAGES_TABLE = 'project_images';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTags(raw) {
  if (!raw) return [];
  try { return Array.isArray(raw) ? raw : JSON.parse(raw); }
  catch { return raw.split(',').map(t => t.trim()).filter(Boolean); }
}

function toBool(v) {
  return v === 'true' || v === true;
}

async function uploadFile(file) {
  if (!file) {
    console.error('[UPLOAD] No file provided');
    return null;
  }
  console.log('[UPLOAD] File details:', { originalname: file.originalname, mimetype: file.mimetype, size: file.size, path: file.path });
  const ext = path.extname(file.originalname);
  const fileName = `${uuidv4()}${ext}`;
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(file.path);
  } catch (readErr) {
    console.error('[UPLOAD] Failed to read file from disk:', readErr.message);
    return null;
  }
  const { error: uploadError } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, fileBuffer, { contentType: file.mimetype, upsert: true });
  try { fs.unlinkSync(file.path); } catch {}
  if (uploadError) {
    console.error('[UPLOAD] Supabase storage upload failed:', uploadError.message);
    return null;
  }
  const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
  console.log('[UPLOAD] Success, URL:', urlData.publicUrl);
  return urlData.publicUrl;
}

async function getAll(req, res) {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (!req.admin) {
    query = query.eq('published', true);
  }
  if (req.query.featured === 'true') {
    query = query.eq('featured', true);
  }
  if (req.query.category) {
    query = query.eq('category', req.query.category);
  }
  if (req.query.search) {
    const term = `%${req.query.search}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},tags::text.ilike.${term}`);
  }
  const sortField = req.query.sort === 'title' ? 'title' :
    req.query.sort === 'updated' ? 'updated_at' : 'created_at';
  const sortOrder = req.query.order === 'asc' ? { ascending: true } : { ascending: false };
  query = query.order(sortField, sortOrder);

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({
    success: true,
    count: data.length,
    total: count || data.length,
    page,
    limit,
    projects: data,
  });
}

async function getFeatured(req, res) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, title, slug, category, description, tags, image_url, live_url, repo_url, featured, created_at')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, projects: data });
}

async function getStats(req, res) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('category, featured')
    .eq('published', true);
  if (error) return res.status(500).json({ success: false, message: error.message });
  const total = data.length;
  const categoryCount = {};
  data.forEach(p => {
    const cat = (p.category || '').toLowerCase();
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
  const featured = data.filter(p => p.featured).length;
  res.json({
    success: true,
    stats: { total, categories, featured },
  });
}

async function getBySlug(req, res) {
  const { slug } = req.params;
  let query = supabase.from(TABLE).select('*, images:project_images(*)').eq('slug', slug);
  if (!req.admin) query = query.eq('published', true);
  const { data, error } = await query.single();
  if (error) return res.status(404).json({ success: false, message: 'Project not found.' });
  res.json({ success: true, project: data });
}

async function getOne(req, res) {
  const { id } = req.params;
  let query = supabase.from(TABLE).select('*, images:project_images(*)').eq('id', id);
  if (!req.admin) query = query.eq('published', true);
  const { data, error } = await query.single();
  if (error) return res.status(404).json({ success: false, message: 'Project not found.' });
  res.json({ success: true, project: data });
}

async function create(req, res) {
  const { title, description, content, tags, live_url, repo_url, featured, published } = req.body;
  const category = (req.body.category || '').toLowerCase();
  if (!title || !category || !description) {
    return res.status(400).json({ success: false, message: 'title, category, and description required.' });
  }
  console.log('[CREATE] body fields:', Object.keys(req.body));
  console.log('[CREATE] files keys:', req.files ? Object.keys(req.files) : 'no files');
  console.log('[CREATE] has single file:', !!req.file);
  let image_url = null;
  if (req.files?.image?.[0]) {
    console.log('[CREATE] Found image in req.files.image[0]');
    image_url = await uploadFile(req.files.image[0]);
  } else if (req.file) {
    console.log('[CREATE] Found image in req.file');
    image_url = await uploadFile(req.file);
  } else {
    console.log('[CREATE] No image file found in request');
  }
  let slug = slugify(title);
  const { data: existing } = await supabase.from(TABLE).select('id').eq('slug', slug).maybeSingle();
  if (existing) slug = `${slug}-${Date.now()}`;

  const projectData = {
    title,
    slug,
    category,
    description,
    content: content || description,
    tags: parseTags(tags),
    image_url,
    live_url: live_url || '',
    repo_url: repo_url || '',
    featured: toBool(featured),
    published: toBool(published),
  };

  const { data, error } = await supabase.from(TABLE).insert(projectData).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });

  const galleryFiles = req.files?.gallery || [];
  if (galleryFiles.length > 0) {
    const imageRecords = [];
    for (let i = 0; i < galleryFiles.length; i++) {
      const url = await uploadFile(galleryFiles[i]);
      if (url) {
        imageRecords.push({
          project_id: data.id,
          image_url: url,
          alt_text: `${title} screenshot ${i + 1}`,
          sort_order: i,
        });
      }
    }
    if (imageRecords.length > 0) {
      await supabase.from(IMAGES_TABLE).insert(imageRecords);
    }
  }

  const { data: fullProject } = await supabase
    .from(TABLE)
    .select('*, images:project_images(*)')
    .eq('id', data.id)
    .single();

  res.status(201).json({ success: true, project: fullProject });
}

async function update(req, res) {
  const { id } = req.params;
  const updates = {};
  const fields = ['title', 'category', 'description', 'content', 'live_url', 'repo_url'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (updates.category) updates.category = updates.category.toLowerCase();
  if (req.body.tags !== undefined) updates.tags = parseTags(req.body.tags);
  if (req.body.featured !== undefined) updates.featured = toBool(req.body.featured);
  if (req.body.published !== undefined) updates.published = toBool(req.body.published);
  if (req.body.title && !req.body.slug) {
    updates.slug = slugify(req.body.title);
    const { data: existing } = await supabase.from(TABLE).select('id').eq('slug', updates.slug).neq('id', id).maybeSingle();
    if (existing) updates.slug = `${updates.slug}-${Date.now()}`;
  }
  const coverFile = req.files?.image?.[0] || req.file;
  if (coverFile) {
    console.log('[UPDATE] Uploading new cover image');
    updates.image_url = await uploadFile(coverFile);
  } else {
    console.log('[UPDATE] No new cover image');
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  updates.updated_at = new Date().toISOString();
  const { error } = await supabase.from(TABLE).update(updates).eq('id', id);
  if (error) return res.status(404).json({ success: false, message: 'Project not found.' });

  const galleryFiles = req.files?.gallery || [];
  if (galleryFiles.length > 0) {
    const { data: maxOrder } = await supabase
      .from(IMAGES_TABLE)
      .select('sort_order')
      .eq('project_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const startOrder = (maxOrder?.sort_order ?? -1) + 1;
    const imageRecords = [];
    for (let i = 0; i < galleryFiles.length; i++) {
      const url = await uploadFile(galleryFiles[i]);
      if (url) {
        imageRecords.push({
          project_id: id,
          image_url: url,
          alt_text: `${updates.title || 'Project'} screenshot ${startOrder + i + 1}`,
          sort_order: startOrder + i,
        });
      }
    }
    if (imageRecords.length > 0) {
      await supabase.from(IMAGES_TABLE).insert(imageRecords);
    }
  }

  const { data: fullProject } = await supabase
    .from(TABLE)
    .select('*, images:project_images(*)')
    .eq('id', id)
    .single();

  res.json({ success: true, project: fullProject });
}

async function togglePublish(req, res) {
  const { id } = req.params;
  const { data: existing } = await supabase.from(TABLE).select('published').eq('id', id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
  const { data, error } = await supabase
    .from(TABLE)
    .update({ published: !existing.published, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, published: data.published, project: data });
}

async function remove(req, res) {
  const { id } = req.params;
  const { data: existing } = await supabase.from(TABLE).select('image_url').eq('id', id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
  if (existing.image_url) {
    const fileName = existing.image_url.split('/').pop();
    if (fileName) await supabase.storage.from('portfolio-images').remove([fileName]);
  }
  const { data: images } = await supabase.from(IMAGES_TABLE).select('image_url').eq('project_id', id);
  if (images && images.length > 0) {
    const fileNames = images.map(img => img.image_url.split('/').pop()).filter(Boolean);
    if (fileNames.length > 0) {
      await supabase.storage.from('portfolio-images').remove(fileNames);
    }
    await supabase.from(IMAGES_TABLE).delete().eq('project_id', id);
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Project deleted.' });
}

async function addImage(req, res) {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ success: false, message: 'Image file required.' });
  const { data: project } = await supabase.from(TABLE).select('id, title').eq('id', id).single();
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
  const image_url = await uploadFile(req.file);
  if (!image_url) return res.status(500).json({ success: false, message: 'Image upload failed.' });
  const { data: maxOrder } = await supabase
    .from(IMAGES_TABLE)
    .select('sort_order')
    .eq('project_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxOrder?.sort_order ?? -1) + 1;
  const { data, error } = await supabase.from(IMAGES_TABLE).insert({
    project_id: id,
    image_url,
    alt_text: req.body.alt_text || `${project.title} screenshot`,
    sort_order,
  }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(201).json({ success: true, image: data });
}

async function removeImage(req, res) {
  const { id, imageId } = req.params;
  const { data: image } = await supabase.from(IMAGES_TABLE).select('image_url').eq('id', imageId).eq('project_id', id).single();
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
  const fileName = image.image_url.split('/').pop();
  if (fileName) await supabase.storage.from('portfolio-images').remove([fileName]);
  const { error } = await supabase.from(IMAGES_TABLE).delete().eq('id', imageId);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Image deleted.' });
}

async function reorderImages(req, res) {
  const { id } = req.params;
  const { imageIds } = req.body;
  if (!Array.isArray(imageIds)) return res.status(400).json({ success: false, message: 'imageIds array required.' });
  const updates = imageIds.map((imageId, index) => ({
    id: imageId,
    project_id: id,
    sort_order: index,
  }));
  for (const upd of updates) {
    await supabase.from(IMAGES_TABLE).update({ sort_order: upd.sort_order }).eq('id', upd.id).eq('project_id', id);
  }
  const { data: images } = await supabase.from(IMAGES_TABLE).select('*').eq('project_id', id).order('sort_order', { ascending: true });
  res.json({ success: true, images });
}

module.exports = { getAll, getFeatured, getStats, getBySlug, getOne, create, update, togglePublish, remove, addImage, removeImage, reorderImages };
