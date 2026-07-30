const supabase = require('../config/db');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const TABLE = 'blog_posts';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getAll(req, res) {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (!req.admin) {
    query = query.eq('published', true);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, count: data.length, posts: data });
}

async function getBySlug(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('slug', req.params.slug).single();
  if (error) return res.status(404).json({ success: false, message: 'Post not found.' });
  await supabase.from(TABLE).update({ views: (data.views || 0) + 1 }).eq('id', data.id);
  res.json({ success: true, post: data });
}

async function create(req, res) {
  const { title, content, excerpt, tags, published } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'title and content required.' });
  }
  let slug = slugify(title);
  let cover_image = null;
  if (req.file) {
    const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const fileBuffer = fs.readFileSync(req.file.path);
    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, fileBuffer, { contentType: req.file.mimetype });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      cover_image = urlData.publicUrl;
    }
    fs.unlinkSync(req.file.path);
  }
  const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
  const { data, error } = await supabase.from(TABLE).insert({
    title, slug, content, excerpt: excerpt || '',
    cover_image, tags: parsedTags,
    published: published === 'true' || published === true,
  }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(201).json({ success: true, post: data });
}

async function update(req, res) {
  const { id } = req.params;
  const updates = {};
  ['title', 'content', 'excerpt'].forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (req.body.tags !== undefined) {
    updates.tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);
  }
  if (req.body.published !== undefined) updates.published = req.body.published === 'true';
  if (req.body.title) updates.slug = slugify(req.body.title);
  if (req.file) {
    const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const fileBuffer = fs.readFileSync(req.file.path);
    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, fileBuffer, { contentType: req.file.mimetype });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      updates.cover_image = urlData.publicUrl;
    }
    fs.unlinkSync(req.file.path);
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
  if (error) return res.status(404).json({ success: false, message: 'Post not found.' });
  res.json({ success: true, post: data });
}

async function togglePublish(req, res) {
  const { id } = req.params;
  const { data: existing } = await supabase.from(TABLE).select('published').eq('id', id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
  const { data, error } = await supabase.from(TABLE)
    .update({ published: !existing.published, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, published: data.published, post: data });
}

async function remove(req, res) {
  const { id } = req.params;
  const { data: existing } = await supabase.from(TABLE).select('cover_image').eq('id', id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
  if (existing.cover_image) {
    const fileName = existing.cover_image.split('/').pop();
    await supabase.storage.from('portfolio-images').remove([fileName]);
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Post deleted.' });
}

module.exports = { getAll, getBySlug, create, update, togglePublish, remove };
