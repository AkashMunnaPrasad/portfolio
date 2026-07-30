require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:' + encodeURIComponent('6kTeHyUgYe877jK6') + '@db.ngyrbwlipbgmdhtjsbzc.supabase.co:5432/postgres' });
(async () => {
  const client = await pool.connect();
  console.log('Creating project_images table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS project_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('project_images table created');
  
  // Also add the foreign key constraint if not already there
  try {
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_images_project'
        ) THEN
          ALTER TABLE project_images ADD CONSTRAINT fk_project_images_project
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  } catch (e) {
    console.log('FK note:', e.message);
  }
  
  // Reload schema cache
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema cache reloaded');
  
  client.release();
  await pool.end();
  console.log('Done');
})();
