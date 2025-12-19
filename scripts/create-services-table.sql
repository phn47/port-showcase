-- ============================================
-- Services Table for 9F Universe CMS
-- ============================================

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published services
CREATE POLICY "Allow public read access to published services"
ON services
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Policy: Allow authenticated users to read all services
CREATE POLICY "Allow authenticated users to read all services"
ON services
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert services
CREATE POLICY "Allow authenticated users to insert services"
ON services
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update services
CREATE POLICY "Allow authenticated users to update services"
ON services
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete (archive) services
CREATE POLICY "Allow authenticated users to delete services"
ON services
FOR DELETE
TO authenticated
USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_services_updated_at();
