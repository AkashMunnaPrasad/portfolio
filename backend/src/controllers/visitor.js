const supabase = require('../config/db');

const TABLE = 'visitors';

async function track(req, res) {
  const { page, referrer, device, city, region, country, ip } = req.body;
  const ua = req.headers['user-agent'] || '';
  if (/bot|crawl|spider|slurp|facebookexternalhit/i.test(ua)) {
    return res.json({ success: true, bot: true });
  }
  const { error } = await supabase.from(TABLE).insert({
    page: page || '/',
    referrer: referrer || 'Direct',
    device: device || 'Desktop',
    city: city || '',
    region: region || '',
    country: country || '',
    ip: ip || req.ip,
    user_agent: ua.slice(0, 300),
  });
  if (error) console.error('[VISITOR]', error.message);
  res.json({ success: true });
}

async function getAnalytics(req, res) {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });

  const now = Date.now();
  const day = 86400000;
  const visitors = data || [];

  const pageMap = {};
  const refMap = {};
  const devices = { Mobile: 0, Desktop: 0 };
  const dailyMap = {};

  for (let i = 13; i >= 0; i--) {
    const k = new Date(now - i * day).toISOString().slice(0, 10);
    dailyMap[k] = 0;
  }

  visitors.forEach(v => {
    pageMap[v.page] = (pageMap[v.page] || 0) + 1;
    const r = v.referrer || 'Direct';
    refMap[r] = (refMap[r] || 0) + 1;
    if (v.device) devices[v.device] = (devices[v.device] || 0) + 1;
    else devices.Desktop++;
    const k = v.created_at?.slice(0, 10);
    if (k && dailyMap[k] !== undefined) dailyMap[k]++;
  });

  res.json({
    success: true,
    analytics: {
      total: visitors.length,
      today: visitors.filter(v => now - new Date(v.created_at).getTime() < day).length,
      week: visitors.filter(v => now - new Date(v.created_at).getTime() < 7 * day).length,
      month: visitors.filter(v => now - new Date(v.created_at).getTime() < 30 * day).length,
      topPages: Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count })),
      devices,
      topReferrers: Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([source, count]) => ({ source, count })),
      dailyVisits: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
    },
  });
}

async function getVisitors(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count, error } = await supabase
    .from(TABLE).select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, total: count, page, limit, visitors: data });
}

module.exports = { track, getAnalytics, getVisitors };
