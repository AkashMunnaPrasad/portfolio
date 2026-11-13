const supabase = require('../config/db');

const TABLE = 'certificates';
const VIEWS_TABLE = 'certificate_views';

function toBool(v) {
  return v === 'true' || v === true;
}

/* ── Public: list published certificates ── */
async function getAll(req, res) {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (!req.admin) {
    query = query.eq('published', true);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, certificates: data || [] });
}

/* ── Public: get a single certificate ── */
async function getById(req, res) {
  const { id } = req.params;
  let query = supabase.from(TABLE).select('*').eq('id', id).single();
  if (!req.admin) query = query.eq('published', true);
  const { data, error } = await query;
  if (error) return res.status(404).json({ success: false, message: 'Certificate not found.' });
  res.json({ success: true, certificate: data });
}

/* ── Admin: create certificate ── */
async function create(req, res) {
  const { title, issuer, date, credential_id, score, type, description, image_url, published } = req.body;
  if (!title || !issuer) {
    return res.status(400).json({ success: false, message: 'title and issuer required.' });
  }
  const { data, error } = await supabase.from(TABLE).insert({
    title,
    issuer,
    date: date || '',
    credential_id: credential_id || '',
    score: score || '',
    type: type || '',
    description: description || '',
    image_url: image_url || '',
    published: toBool(published),
  }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(201).json({ success: true, certificate: data });
}

/* ── Admin: update certificate ── */
async function update(req, res) {
  const { id } = req.params;
  const fields = ['title', 'issuer', 'date', 'credential_id', 'score', 'type', 'description', 'image_url'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (req.body.published !== undefined) updates.published = toBool(req.body.published);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
  if (error) return res.status(404).json({ success: false, message: 'Certificate not found.' });
  res.json({ success: true, certificate: data });
}

/* ── Admin: delete certificate ── */
async function remove(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Certificate deleted.' });
}

/* ── Admin: toggle publish ── */
async function togglePublish(req, res) {
  const { id } = req.params;
  const { data: existing } = await supabase.from(TABLE).select('published').eq('id', id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
  const { data, error } = await supabase
    .from(TABLE)
    .update({ published: !existing.published, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, published: data.published, certificate: data });
}

/* ── Public: record a certificate view (sends viewer session/IP to admin) ── */
async function trackView(req, res) {
  const { id: certificateId } = req.params;
  const { browser, os, device, screen, language, timezone } = req.body || {};
  const ua = req.headers['user-agent'] || '';
  const cfIp = req.headers['cf-connecting-ip'];
  const ip = (typeof cfIp === 'string' && cfIp.trim()) || req.ip;

  // Verify certificate exists
  const { data: cert } = await supabase.from(TABLE).select('id').eq('id', certificateId).maybeSingle();
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });

  await supabase.from(VIEWS_TABLE).insert({
    certificate_id: certificateId,
    ip: ip || '',
    user_agent: ua.slice(0, 300),
    browser: browser || 'Unknown',
    os: os || 'Unknown',
    device: device || 'Desktop',
    screen: screen || '',
    language: language || '',
    timezone: timezone || '',
  });
  res.json({ success: true });
}

/* ── Admin: list certificate views (who viewed which certificate) ── */
async function getViews(req, res) {
  const { data, error } = await supabase
    .from(VIEWS_TABLE)
    .select('*, certificates(title, issuer)')
    .order('viewed_at', { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, views: data || [] });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  togglePublish,
  trackView,
  getViews,
};
