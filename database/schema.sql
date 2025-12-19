-- ============================================
-- 9F Universe CMS - Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (Profile extension for Supabase Auth)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. TAGS
-- ============================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- ============================================
-- 3. ARTWORKS
-- ============================================

CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Illustration', 'Animation', 'Logo', 'Banner', 
    'NFT', 'Meme', 'Sticker', 'Animated Sticker', 
    'GIF', 'Social Media', 'Comic'
  )),
  year INTEGER,
  medium TEXT,
  dimensions TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_display_order ON artworks(display_order);
CREATE INDEX idx_artworks_featured ON artworks(featured);
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_published_at ON artworks(published_at) WHERE status = 'published';
CREATE INDEX idx_artworks_metadata ON artworks USING GIN(metadata);

-- Full-text search index
CREATE INDEX idx_artworks_search ON artworks USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================
-- 4. ARTWORK MEDIA
-- ============================================

CREATE TABLE artwork_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  alt_text TEXT,
  dominant_color TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artwork_media_artwork_id ON artwork_media(artwork_id);
CREATE INDEX idx_artwork_media_display_order ON artwork_media(display_order);
CREATE INDEX idx_artwork_media_is_primary ON artwork_media(is_primary);

-- ============================================
-- 5. ARTWORK TAGS (Many-to-Many)
-- ============================================

CREATE TABLE artwork_tags (
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, tag_id)
);

CREATE INDEX idx_artwork_tags_artwork_id ON artwork_tags(artwork_id);
CREATE INDEX idx_artwork_tags_tag_id ON artwork_tags(tag_id);

-- ============================================
-- 6. TIMELINE ENTRIES
-- ============================================

CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_label TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  media_alt TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_timeline_entries_status ON timeline_entries(status);
CREATE INDEX idx_timeline_entries_display_order ON timeline_entries(display_order);
CREATE INDEX idx_timeline_entries_published_at ON timeline_entries(published_at) WHERE status = 'published';

-- ============================================
-- 7. SITE SETTINGS
-- ============================================

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
('hero', '{
  "headline": "WE DREAM",
  "subheadline": "WE DO",
  "cta": "WE DELIVER",
  "background_video_url": "https://www.dropbox.com/scl/fi/vcrkezj1o8uhxjf9ef5eu/Video-website.webm?rlkey=hpeylm20potbho8knn3kmyh56&e=2&st=ga2wivnf&raw=1",
  "background_image_url": null
}'),
('seo', '{
  "title": "9F Universe",
  "description": "Creative portfolio of 9F Studio",
  "og_image": null,
  "twitter_handle": "@9FStudioArt"
}'),
('social', '{
  "twitter": "https://x.com/9FStudioArt",
  "email": "hello@9f.com",
  "instagram": null,
  "discord": null
}'),
('chat', '{
  "enabled": true,
  "provider": "gemini",
  "provider_key_reference": "GEMINI_API_KEY",
  "welcome_message": "Welcome to 9F Universe. How can we elevate your vision today?"
}');

-- ============================================
-- 8. REVISIONS (Version History)
-- ============================================

CREATE TABLE revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('artwork', 'timeline_entry', 'site_setting')),
  entity_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  comment TEXT
);

CREATE INDEX idx_revisions_entity ON revisions(entity_type, entity_id);
CREATE INDEX idx_revisions_created_at ON revisions(created_at DESC);

-- ============================================
-- 9. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Public can view user profiles (limited fields)
CREATE POLICY "Public can view user profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can manage all users (use function to avoid recursion)
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (is_admin());

-- ============================================
-- TAGS POLICIES
-- ============================================

-- Public can view tags
CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  USING (true);

-- Admins and editors can manage tags
CREATE POLICY "Admins and editors can manage tags"
  ON tags FOR ALL
  USING (is_admin_or_editor());

-- ============================================
-- ARTWORKS POLICIES
-- ============================================

-- Public can view published artworks
CREATE POLICY "Public can view published artworks"
  ON artworks FOR SELECT
  USING (status = 'published');

-- Admins and editors can view all artworks
CREATE POLICY "Admins and editors can view all artworks"
  ON artworks FOR SELECT
  USING (is_admin_or_editor());

-- Admins and editors can manage artworks
CREATE POLICY "Admins and editors can manage artworks"
  ON artworks FOR ALL
  USING (is_admin_or_editor());

-- ============================================
-- ARTWORK MEDIA POLICIES
-- ============================================

-- Public can view media of published artworks
CREATE POLICY "Public can view published artwork media"
  ON artwork_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = artwork_media.artwork_id
      AND artworks.status = 'published'
    )
  );

-- Admins and editors can manage all media
CREATE POLICY "Admins and editors can manage artwork media"
  ON artwork_media FOR ALL
  USING (is_admin_or_editor());

-- ============================================
-- ARTWORK TAGS POLICIES
-- ============================================

-- Public can view artwork tags
CREATE POLICY "Public can view artwork tags"
  ON artwork_tags FOR SELECT
  USING (true);

-- Admins and editors can manage artwork tags
CREATE POLICY "Admins and editors can manage artwork tags"
  ON artwork_tags FOR ALL
  USING (is_admin_or_editor());

-- ============================================
-- TIMELINE ENTRIES POLICIES
-- ============================================

-- Public can view published timeline entries
CREATE POLICY "Public can view published timeline entries"
  ON timeline_entries FOR SELECT
  USING (status = 'published');

-- Admins and editors can view all timeline entries
CREATE POLICY "Admins and editors can view all timeline entries"
  ON timeline_entries FOR SELECT
  USING (is_admin_or_editor());

-- Admins and editors can manage timeline entries
CREATE POLICY "Admins and editors can manage timeline entries"
  ON timeline_entries FOR ALL
  USING (is_admin_or_editor());

-- ============================================
-- SITE SETTINGS POLICIES
-- ============================================

-- Public can view site settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only admins can update site settings
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

-- ============================================
-- REVISIONS POLICIES
-- ============================================

-- Admins and editors can view revisions
CREATE POLICY "Admins and editors can view revisions"
  ON revisions FOR SELECT
  USING (is_admin_or_editor());

-- Admins and editors can create revisions
CREATE POLICY "Admins and editors can create revisions"
  ON revisions FOR INSERT
  WITH CHECK (is_admin_or_editor());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- System can create audit logs (via service role)
-- Note: This is typically done via Edge Functions with service role key

-- ============================================
-- 11. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_entries_updated_at
  BEFORE UPDATE ON timeline_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create revision on update
CREATE OR REPLACE FUNCTION create_revision()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO revisions (entity_type, entity_id, snapshot, author_id)
  VALUES (
    TG_TABLE_NAME::text,
    NEW.id,
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to artworks and timeline_entries
CREATE TRIGGER create_artwork_revision
  AFTER UPDATE ON artworks
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_revision();

CREATE TRIGGER create_timeline_revision
  AFTER UPDATE ON timeline_entries
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_revision();

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin or editor
CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- END OF SCHEMA
-- ============================================
