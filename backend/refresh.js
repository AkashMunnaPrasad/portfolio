require('dotenv').config();
const { Pool } = require('pg');

const password = '6kTeHyUgYe877jK6';
const projectRef = 'ngyrbwlipbgmdhtjsbzc';

async function run() {
  const connStr = 'postgresql://postgres:' + encodeURIComponent(password) + '@db.' + projectRef + '.supabase.co:5432/postgres';
  const pool = new Pool({ connectionString: connStr });
  const client = await pool.connect();
  console.log('Connected');

  // Force PostgREST schema cache reload
  console.log('Reloading schema cache...');
  await client.query("NOTIFY pgrst, 'reload schema'");
  
  // Also try direct schema cache update
  try {
    await client.query("SELECT pg_catalog.pg_postmaster_start_time()");
  } catch (e) {}
  
  console.log('Schema cache reload sent.');
  
  // Verify
  const { rows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND table_schema = 'public' ORDER BY ordinal_position");
  console.log('Projects columns:', rows.map(r => r.column_name).join(', '));
  
  client.release();
  await pool.end();
  console.log('Done');
}

run().catch(console.error);
