const supabase = require('../config/db');
const { sendContactNotification } = require('../utils/email');

const TABLE = 'contacts';

const sanitize = (s = '') => s.trim().replace(/<[^>]*>/g, '').slice(0, 2000);

async function submit(req, res) {
  const name = sanitize(req.body.name || '');
  const email = sanitize(req.body.email || '');
  const subject = sanitize(req.body.subject || '');
  const message = sanitize(req.body.message || '');

  const errors = [];
  if (!name || name.length < 2) errors.push('Please provide a valid name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please provide a valid email.');
  if (!message || message.length < 10) errors.push('Message must be at least 10 characters.');
  if (errors.length) return res.status(400).json({ success: false, errors });

  const { data, error } = await supabase.from(TABLE).insert({
    name, email, subject, message,
    read: false, replied: false,
  }).select().single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  await sendContactNotification(name, email, subject, message);

  res.json({ success: true, message: "Thanks! I'll get back to you within 24 hours." });
}

async function getAll(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = req.query.filter;
  let query = supabase.from(TABLE).select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (filter === 'unread') query = query.eq('read', false);
  if (filter === 'read') query = query.eq('read', true);
  if (filter === 'replied') query = query.eq('replied', true);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count, error } = await query.range(from, to);
  if (error) return res.status(500).json({ success: false, message: error.message });
  const { count: unreadCount } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('read', false);
  res.json({ success: true, total: count, page, limit, unreadCount, contacts: data });
}

async function getOne(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ success: false, message: 'Not found.' });
  await supabase.from(TABLE).update({ read: true }).eq('id', req.params.id);
  res.json({ success: true, contact: { ...data, read: true } });
}

async function update(req, res) {
  const updates = {};
  if (req.body.read !== undefined) updates.read = req.body.read;
  if (req.body.replied !== undefined) updates.replied = req.body.replied;
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, contact: data });
}

async function remove(req, res) {
  const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Deleted.' });
}

module.exports = { submit, getAll, getOne, update, remove };
