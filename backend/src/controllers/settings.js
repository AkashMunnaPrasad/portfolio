const supabase = require('../config/db');

const TABLE = 'site_settings';

async function getAll(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) return res.status(500).json({ success: false, message: error.message });
  const settings = {};
  data.forEach(s => { settings[s.key] = s.value; });
  res.json({ success: true, settings });
}

async function update(req, res) {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ success: false, message: 'key required.' });
  const { data, error } = await supabase.from(TABLE).upsert({ key, value }).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, setting: data });
}

async function dashboard(req, res) {
  const [contacts, subscribers, projects, blog, experience, education] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('experiences').select('*', { count: 'exact', head: true }),
    supabase.from('education').select('*', { count: 'exact', head: true }),
  ]);
  res.json({
    success: true,
    summary: {
      contacts: contacts.count || 0,
      subscribers: subscribers.count || 0,
      projects: projects.count || 0,
      blogPosts: blog.count || 0,
      experiences: experience.count || 0,
      education: education.count || 0,
    },
  });
}

module.exports = { getAll, update, dashboard };
