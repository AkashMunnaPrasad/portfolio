require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:' + encodeURIComponent('6kTeHyUgYe877jK6') + '@db.ngyrbwlipbgmdhtjsbzc.supabase.co:5432/postgres' });
(async () => {
  const client = await pool.connect();
  const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Tables:', rows.map(r => r.table_name).join(', '));
  client.release();
  await pool.end();
})();
