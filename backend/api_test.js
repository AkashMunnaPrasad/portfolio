require('dotenv').config();
const https = require('https');

const projectRef = 'ngyrbwlipbgmdhtjsbzc';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

function callAPI(url, method, body, authHeader) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      method,
      headers: {
        'Authorization': authHeader || ('Bearer ' + serviceKey),
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ error: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  // Try Management API with service key as Bearer token
  console.log('=== Trying Management API with service key ===');
  let r = await callAPI(`https://api.supabase.com/v1/projects/${projectRef}/database/settings`, 'GET');
  console.log(`GET /database/settings: ${r.status}`);
  if (r.status === 200) {
    console.log('Body:', r.body.substring(0, 500));
  } else {
    console.log('Error:', r.body?.substring(0, 200));
  }

  // Try different auth headers
  console.log('\n=== Trying with apikey header ===');
  const u = new URL(`https://api.supabase.com/v1/projects/${projectRef}/database/settings`);
  const opts = {
    hostname: u.hostname,
    path: u.pathname,
    method: 'GET',
    headers: {
      'apikey': serviceKey,
      'Authorization': 'Bearer ' + serviceKey,
    },
    timeout: 15000,
  };
  const req = https.request(opts, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Body:', data.substring(0, 300));
    });
  });
  req.on('error', e => console.log('Error:', e.message));
  req.end();
}

run();
