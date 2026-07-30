const supabase = require('../config/db');
const { getMailer } = require('../utils/email');
const ENV = require('../config/env');

const TABLE = 'subscribers';

async function subscribe(req, res) {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }
  const { data: existing } = await supabase.from(TABLE).select('id').eq('email', email).maybeSingle();
  if (existing) {
    return res.json({ success: true, message: "You're already subscribed!" });
  }
  const ip_address = req.ip;
  const { error } = await supabase.from(TABLE).insert({ email, active: true, ip_address });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, message: 'Subscribed successfully! Thank you.' });
}

async function getAll(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, total: data.length, subscribers: data });
}

async function remove(req, res) {
  const email = decodeURIComponent(req.params.email);
  const { error } = await supabase.from(TABLE).delete().eq('email', email);
  if (error) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, message: 'Removed.' });
}

async function broadcast(req, res) {
  const { subject, html_body, text_body } = req.body;
  if (!subject || !html_body) {
    return res.status(400).json({ success: false, message: 'subject and html_body required.' });
  }
  const mailer = getMailer();
  if (!mailer) return res.status(503).json({ success: false, message: 'Mail not configured.' });
  const { data: subscribers } = await supabase.from(TABLE).select('email').eq('active', true);
  if (!subscribers || subscribers.length === 0) {
    return res.json({ success: true, sent: 0, failed: 0, total: 0 });
  }
  let sent = 0, failed = 0;
  for (const sub of subscribers) {
    try {
      await mailer.sendMail({
        from: `"Portfolio" <${ENV.MAIL_USER}>`,
        to: sub.email,
        subject,
        html: html_body,
        text: text_body || '',
      });
      sent++;
    } catch {
      failed++;
    }
  }
  res.json({ success: true, sent, failed, total: subscribers.length });
}

module.exports = { subscribe, getAll, remove, broadcast };
