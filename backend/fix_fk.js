require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:' + encodeURIComponent('6kTeHyUgYe877jK6') + '@db.ngyrbwlipbgmdhtjsbzc.supabase.co:5432/postgres' });
(async () => {
  const client = await pool.connect();
  
  // Check constraints on project_images
  const c = await client.query(`
    SELECT con.conname, con.contype, pg_get_constraintdef(con.oid) 
    FROM pg_constraint con 
    JOIN pg_class rel ON rel.oid = con.conrelid 
    WHERE rel.relname = 'project_images'
  `);
  console.log('Constraints:', JSON.stringify(c.rows, null, 2));
  
  // Drop and recreate FK properly
  console.log('Dropping existing FK constraints...');
  await client.query('ALTER TABLE project_images DROP CONSTRAINT IF EXISTS fk_project_images_project');
  await client.query('ALTER TABLE project_images DROP CONSTRAINT IF EXISTS project_images_project_id_fkey');
  
  console.log('Recreating FK with simple name...');
  await client.query(`
    ALTER TABLE project_images 
    ADD CONSTRAINT project_images_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  `);
  
  console.log('FK recreated');
  
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema cache reloaded');
  
  client.release();
  await pool.end();
})();
