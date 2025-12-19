// ============================================
// 9F Universe CMS - TypeScript Types
// Generated from Supabase schema
// ============================================

// ============================================
// Database Types
// ============================================

export type UserRole = 'admin' | 'editor' | 'viewer';
export type ArtworkStatus = 'draft' | 'published' | 'archived';
export type TimelineStatus = 'draft' | 'published' | 'archived';
export type ServiceStatus = 'draft' | 'published' | 'archived';
export type MediaType = 'image' | 'video';
export type EntityType = 'artwork' | 'timeline_entry' | 'service' | 'site_setting';

export type ArtworkCategory =
  | 'Illustration'
  | 'Animation'
  | 'Logo'
  | 'Banner'
  | 'NFT'
  | 'Meme'
  | 'Sticker'
  | 'Animated Sticker'
  | 'GIF'
  | 'Social Media'
  | 'Comic';

// ============================================
// User
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

// ============================================
// Tag
// ============================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

// ============================================
// Artwork
// ============================================

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category: ArtworkCategory;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  status: ArtworkStatus;
  featured: boolean;
  display_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  // Relations
  media?: ArtworkMedia[];
  tags?: Tag[];
}

// ============================================
// Artwork Media
// ============================================

export interface ArtworkMedia {
  id: string;
  artwork_id: string;
  type: MediaType;
  url: string;
  storage_key: string;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  alt_text?: string | null;
  dominant_color?: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

// ============================================
// Timeline Entry
// ============================================

export interface TimelineEntry {
  id: string;
  date_label: string;
  title: string;
  body?: string | null;
  media_url?: string | null;
  media_alt?: string | null;
  display_order: number;
  status: TimelineStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

// ============================================
// Service
// ============================================

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  status: ServiceStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

// ============================================
// Site Settings
// ============================================

export interface HeroSettings {
  headline: string;
  subheadline: string;
  cta: string;
  background_video_url?: string | null;
  background_image_url?: string | null;
}

export interface SEOSettings {
  title: string;
  description: string;
  og_image?: string | null;
  twitter_handle?: string | null;
}

export interface SocialSettings {
  twitter?: string | null;
  email?: string | null;
  instagram?: string | null;
  discord?: string | null;
}

export interface ChatSettings {
  enabled: boolean;
  provider: 'gemini' | 'openai' | 'custom';
  provider_key_reference: string;
  welcome_message: string;
}

export interface SiteSettings {
  key: string;
  value: HeroSettings | SEOSettings | SocialSettings | ChatSettings;
  updated_at: string;
  updated_by?: string | null;
}

// ============================================
// Revision
// ============================================

export interface Revision {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  snapshot: Record<string, unknown>;
  author_id?: string | null;
  created_at: string;
  comment?: string | null;
  // Relations
  author?: User;
}

// ============================================
// Audit Log
// ============================================

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'login'
  | 'logout'
  | 'upload'
  | 'rollback';

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: AuditAction;
  entity_type?: EntityType | null;
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  // Relations
  actor?: User;
}

// ============================================
// API Request/Response Types
// ============================================

// Create Artwork
export interface CreateArtworkRequest {
  title: string;
  slug: string;
  description?: string;
  category: ArtworkCategory;
  year?: number;
  medium?: string;
  dimensions?: string;
  status?: ArtworkStatus;
  featured?: boolean;
  display_order?: number;
  metadata?: Record<string, unknown>;
  tags?: string[]; // Tag IDs
  media?: Omit<ArtworkMedia, 'id' | 'artwork_id' | 'created_at'>[];
}

// Update Artwork
export type UpdateArtworkRequest = Partial<CreateArtworkRequest>;

// Reorder Artworks
export interface ReorderArtworksRequest {
  items: Array<{
    id: string;
    display_order: number;
  }>;
}

// Create Timeline Entry
export interface CreateTimelineEntryRequest {
  date_label: string;
  title: string;
  body?: string;
  media_url?: string;
  media_alt?: string;
  display_order?: number;
  status?: TimelineStatus;
  metadata?: Record<string, unknown>;
}

// Update Timeline Entry
export type UpdateTimelineEntryRequest = Partial<CreateTimelineEntryRequest>;

// Reorder Timeline Entries
export interface ReorderTimelineEntriesRequest {
  items: Array<{
    id: string;
    display_order: number;
  }>;
}

// Create Service
export interface CreateServiceRequest {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  status?: ServiceStatus;
  metadata?: Record<string, unknown>;
}

// Update Service
export type UpdateServiceRequest = Partial<CreateServiceRequest>;

// Reorder Services
export interface ReorderServicesRequest {
  items: Array<{
    id: string;
    display_order: number;
  }>;
}

// Create Tag
export interface CreateTagRequest {
  name: string;
  slug: string;
  color?: string;
}

// Update Tag
export type UpdateTagRequest = Partial<CreateTagRequest>;

// Update Site Settings
export interface UpdateSiteSettingsRequest {
  value: HeroSettings | SEOSettings | SocialSettings | ChatSettings;
}

// Upload Media Response
export interface UploadMediaResponse {
  url: string;
  storage_key: string;
  width?: number;
  height?: number;
  file_size?: number;
}

// ============================================
// Filter & Query Types
// ============================================

export interface ArtworkFilters {
  status?: ArtworkStatus | 'all';
  category?: ArtworkCategory;
  tags?: string[]; // Tag slugs
  year?: number;
  featured?: boolean;
  q?: string; // Search query
  limit?: number;
  offset?: number;
  order?: 'display_order.asc' | 'display_order.desc' | 'created_at.desc' | 'created_at.asc';
}

export interface TimelineFilters {
  status?: TimelineStatus | 'all';
  limit?: number;
  offset?: number;
  order?: 'display_order.asc' | 'display_order.desc';
}

export interface ServiceFilters {
  status?: ServiceStatus | 'all';
  limit?: number;
  offset?: number;
  order?: 'display_order.asc' | 'display_order.desc' | 'created_at.desc' | 'created_at.asc';
}

// ============================================
// Gallery Item (for frontend compatibility)
// ============================================

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
  tags?: readonly string[];
  contain?: boolean;
  description?: string;
  dimensions?: string;
  fileSize?: string;
  format?: string;
}

// Helper to convert Artwork to GalleryItem
export function artworkToGalleryItem(artwork: Artwork): GalleryItem {
  const primaryMedia = artwork.media?.find((m) => m.is_primary) || artwork.media?.[0];

  return {
    id: artwork.id,
    src: primaryMedia?.url || '',
    title: artwork.title,
    category: artwork.category,
    tags: artwork.tags?.map((t) => t.slug) || [],
    contain: ['Logo', 'Sticker', 'Animated Sticker', 'NFT', 'Meme', 'GIF', 'Animation'].includes(
      artwork.category
    ),
    description: artwork.description || undefined,
    dimensions: artwork.dimensions || undefined,
    fileSize: primaryMedia?.file_size ? `${Math.round(primaryMedia.file_size / 1024)} KB` : undefined,
    format: primaryMedia?.type === 'image' ? 'JPG' : primaryMedia?.type === 'video' ? 'MP4' : undefined,
  };
}
