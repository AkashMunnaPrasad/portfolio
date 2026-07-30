const supabase = require('../config/db');

const TABLE = 'skills';

async function getAll(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, skills: data });
}

async function create(req, res) {
  const { name, category, percent, level, icon, sort_order } = req.body;
  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'name and category required.' });
  }
  const { data, error } = await supabase.from(TABLE).insert({
    name, category,
    percent: parseInt(percent) || 0,
    level: level || 'Beginner',
    icon: icon || null,
    sort_order: parseInt(sort_order) || 0,
  }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(201).json({ success: true, skill: data });
}

async function update(req, res) {
  const { id } = req.params;
  const updates = {};
  ['name', 'category', 'level', 'icon'].forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (req.body.percent !== undefined) updates.percent = parseInt(req.body.percent);
  if (req.body.sort_order !== undefined) updates.sort_order = parseInt(req.body.sort_order);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
  if (error) return res.status(404).json({ success: false, message: 'Skill not found.' });
  res.json({ success: true, skill: data });
}

async function remove(req, res) {
  const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Skill deleted.' });
}

module.exports = { getAll, create, update, remove };
