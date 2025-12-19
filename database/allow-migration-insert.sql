-- ============================================
-- Allow Migration Inserts - Temporary Policy
-- Run this BEFORE migration, then remove after
-- ============================================

-- Policy to allow inserts into artworks during migration
-- This allows inserts even without authenticated user
CREATE POLICY "Allow migration inserts to artworks"
  ON artworks FOR INSERT
  WITH CHECK (true);

-- Policy to allow inserts into artwork_media
CREATE POLICY "Allow migration inserts to artwork_media"
  ON artwork_media FOR INSERT
  WITH CHECK (true);

-- Policy to allow inserts into artwork_tags
CREATE POLICY "Allow migration inserts to artwork_tags"
  ON artwork_tags FOR INSERT
  WITH CHECK (true);

-- Policy to allow inserts into tags
CREATE POLICY "Allow migration inserts to tags"
  ON tags FOR INSERT
  WITH CHECK (true);

-- ============================================
-- After migration completes, run this to remove temporary policies:
-- ============================================

/*
DROP POLICY IF EXISTS "Allow migration inserts to artworks" ON artworks;
DROP POLICY IF EXISTS "Allow migration inserts to artwork_media" ON artwork_media;
DROP POLICY IF EXISTS "Allow migration inserts to artwork_tags" ON artwork_tags;
DROP POLICY IF EXISTS "Allow migration inserts to tags" ON tags;
*/
