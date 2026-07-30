-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- or via psql to create the RPC function for atomic view counting.

CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET views = COALESCE(views, 0) + 1
  WHERE id = project_id;
END;
$$;
