-- ============================================
-- Check RLS Policies & User Roles
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CHECK USER ROLES
-- ============================================

-- Check users table
SELECT 
  id,
  email,
  role,
  created_at,
  last_login_at
FROM users
ORDER BY created_at DESC;

-- Check auth.users (Supabase Auth)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Match users với auth.users
SELECT 
  u.id,
  u.email,
  u.role,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- 2. CHECK RLS POLICIES STATUS
-- ============================================

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'artworks', 'artwork_media', 'artwork_tags', 
    'tags', 'timeline_entries', 'site_settings', 
    'revisions', 'audit_logs'
  )
ORDER BY tablename;

-- ============================================
-- 3. CHECK ALL POLICIES
-- ============================================

-- List all policies for each table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 4. CHECK SPECIFIC POLICIES FOR ARTWORKS
-- ============================================

-- Artworks policies detail
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'artworks'
ORDER BY policyname;

-- ============================================
-- 5. TEST RLS AS CURRENT USER
-- ============================================

-- Check current user context
SELECT 
  current_user,
  session_user,
  current_setting('request.jwt.claims', true)::json->>'sub' as user_id,
  current_setting('request.jwt.claims', true)::json->>'email' as user_email;

-- Test if current user can see artworks
SELECT COUNT(*) as visible_artworks
FROM artworks;

-- Test if current user can see all artworks (admin/editor)
SELECT COUNT(*) as total_artworks
FROM artworks
WHERE EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role IN ('admin', 'editor')
);

-- ============================================
-- 6. CHECK HELPER FUNCTIONS
-- ============================================

-- Check if helper functions exist
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname IN ('is_admin', 'is_admin_or_editor', 'get_user_role')
ORDER BY proname;

-- Test helper functions
SELECT 
  is_admin() as is_admin_result,
  is_admin_or_editor() as is_admin_or_editor_result,
  get_user_role() as user_role;

-- ============================================
-- 7. CHECK ARTWORKS DATA ACCESS
-- ============================================

-- Count by status (should work for admin)
SELECT 
  status,
  COUNT(*) as count
FROM artworks
GROUP BY status
ORDER BY status;

-- Check if you can insert (test - don't actually insert)
-- This will show if INSERT policy works
SELECT 
  'INSERT test' as test_type,
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'artworks'
    AND cmd = 'INSERT'
    AND (qual IS NULL OR qual = 'true')
  ) as has_insert_policy;

-- ============================================
-- 8. VERIFY USER PERMISSIONS
-- ============================================

-- Check what the current user can do
SELECT 
  'Current User ID' as check_type,
  auth.uid()::text as value
UNION ALL
SELECT 
  'User Role',
  (SELECT role FROM users WHERE id = auth.uid())::text
UNION ALL
SELECT 
  'Can View All Artworks',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    ) THEN 'YES'
    ELSE 'NO'
  END
UNION ALL
SELECT 
  'Can View Published Artworks',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM artworks 
      WHERE status = 'published'
      LIMIT 1
    ) THEN 'YES'
    ELSE 'NO'
  END;

-- ============================================
-- 9. QUICK FIXES (if needed)
-- ============================================

-- If user doesn't have role, update it:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- If RLS is blocking, temporarily disable (ONLY FOR TESTING):
-- ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
-- Then re-enable after testing:
-- ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- END
-- ============================================
