require('dotenv').config();
const { Pool } = require('pg');

const projectRef = 'ngyrbwlipbgmdhtjsbzc';
const password = '6kTeHyUgYe877jK6';

function p(url) { return encodeURIComponent(password); }

async function tryConn(connStr, label) {
  const pool = new Pool({ connectionString: connStr, connectionTimeoutMillis: 8000 });
  try {
    const client = await pool.connect();
    console.log(' CONNECTED!');

    console.log('Adding slug column...');
    await client.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''");

    console.log('Adding content column...');
    await client.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT DEFAULT ''");

    console.log('Removing views column...');
    await client.query('ALTER TABLE projects DROP COLUMN IF EXISTS views');

    console.log('Adding ip_address to subscribers...');
    await client.query("ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT ''");

    try {
      await client.query("NOTIFY pgrst, 'reload schema'");
      console.log('Schema cache reloaded');
    } catch (e) {}

    client.release();
    await pool.end();
    return true;
  } catch (err) {
    await pool.end();
    console.log(' failed: ' + err.message.substring(0, 80));
    return false;
  }
}

async function run() {
  // Direct connection first
  console.log('Direct DB...');
  if (await tryConn('postgresql://postgres:' + p() + '@db.' + projectRef + '.supabase.co:5432/postgres', 'Direct')) return;

  // Try various pooler configurations
  var regions = ['us-west-1', 'us-east-1', 'eu-west-1', 'eu-central-1',
                 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
                 'ca-central-1', 'sa-east-1'];

  for (var r = 0; r < regions.length; r++) {
    var region = regions[r];
    for (var u = 0; u < 2; u++) {
      var user = u === 0 ? 'postgres' : 'postgres.' + projectRef;
      for (var port = 0; port < 2; port++) {
        var pn = port === 0 ? 6543 : 5432;
        var label = 'Pooler ' + region + ':' + pn + ' user=' + user;
        process.stdout.write(label);
        var conn = 'postgresql://' + user + ':' + p() + '@aws-0-' + region + '.pooler.supabase.com:' + pn + '/postgres';
        if (await tryConn(conn, label)) return;
      }
    }
  }

  console.log('\nCould not connect. The password might be incorrect or the project is in an unlisted region.');
  console.log('Please verify the password from your Supabase dashboard.');
}

run();
