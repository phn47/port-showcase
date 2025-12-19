-- ============================================
-- Fix RLS Policies - Remove Infinite Recursion
-- Run this AFTER running the main schema.sql
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins and editors can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins and editors can view all artworks" ON artworks;
DROP POLICY IF EXISTS "Admins and editors can manage artworks" ON artworks;
DROP POLICY IF EXISTS "Admins and editors can manage artwork media" ON artwork_media;
DROP POLICY IF EXISTS "Admins and editors can manage artwork tags" ON artwork_tags;
DROP POLICY IF EXISTS "Admins and editors can view all timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Admins and editors can manage timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins and editors can view revisions" ON revisions;
DROP POLICY IF EXISTS "Admins and editors can create revisions" ON revisions;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

-- Create helper functions first (if not exists)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate policies using helper functions
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (is_admin());

CREATE POLICY "Admins and editors can manage tags"
  ON tags FOR ALL
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can view all artworks"
  ON artworks FOR SELECT
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can manage artworks"
  ON artworks FOR ALL
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can manage artwork media"
  ON artwork_media FOR ALL
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can manage artwork tags"
  ON artwork_tags FOR ALL
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can view all timeline entries"
  ON timeline_entries FOR SELECT
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can manage timeline entries"
  ON timeline_entries FOR ALL
  USING (is_admin_or_editor());

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins and editors can view revisions"
  ON revisions FOR SELECT
  USING (is_admin_or_editor());

CREATE POLICY "Admins and editors can create revisions"
  ON revisions FOR INSERT
  WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());
