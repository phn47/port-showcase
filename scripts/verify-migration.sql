-- ============================================
-- Verify Migration Results
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check total artworks
SELECT 
  COUNT(*) as total_artworks,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived
FROM artworks;

-- 2. Check by category
SELECT 
  category,
  COUNT(*) as count
FROM artworks
GROUP BY category
ORDER BY count DESC;

-- 3. Check tags
SELECT 
  COUNT(DISTINCT tags.id) as total_tags,
  COUNT(artwork_tags.artwork_id) as total_tag_relationships
FROM tags
LEFT JOIN artwork_tags ON tags.id = artwork_tags.tag_id;

-- 4. Check media
SELECT 
  COUNT(*) as total_media,
  COUNT(CASE WHEN type = 'image' THEN 1 END) as images,
  COUNT(CASE WHEN type = 'video' THEN 1 END) as videos
FROM artwork_media;

-- 5. Top tags
SELECT 
  t.name,
  COUNT(at.artwork_id) as usage_count
FROM tags t
LEFT JOIN artwork_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name
ORDER BY usage_count DESC
LIMIT 20;

-- 6. Sample artworks
SELECT 
  id,
  title,
  category,
  status,
  display_order,
  created_at
FROM artworks
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check for missing media
SELECT 
  a.id,
  a.title,
  a.category
FROM artworks a
LEFT JOIN artwork_media am ON a.id = am.artwork_id
WHERE am.id IS NULL
LIMIT 10;
