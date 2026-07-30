const supabase = require('../config/db');

const TABLE = 'education';

async function getAll(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, education: data });
}

async function create(req, res) {
  const { degree, institution, location, start_date, end_date, current, description, sort_order } = req.body;
  if (!degree || !institution) {
    return res.status(400).json({ success: false, message: 'degree and institution required.' });
  }
  const { data, error } = await supabase.from(TABLE).insert({
    degree, institution, location: location || '',
    start_date, end_date: end_date || null,
    current: current === 'true' || current === true,
    description: description || '',
    sort_order: parseInt(sort_order) || 0,
  }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(201).json({ success: true, education: data });
}

async function update(req, res) {
  const { id } = req.params;
  const updates = {};
  ['degree', 'institution', 'location', 'start_date', 'end_date', 'description'].forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (req.body.current !== undefined) updates.current = req.body.current === 'true';
  if (req.body.sort_order !== undefined) updates.sort_order = parseInt(req.body.sort_order);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
  if (error) return res.status(404).json({ success: false, message: 'Education not found.' });
  res.json({ success: true, education: data });
}

async function remove(req, res) {
  const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Education deleted.' });
}

module.exports = { getAll, create, update, remove };
