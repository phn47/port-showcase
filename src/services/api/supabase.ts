// ============================================
// 9F Universe CMS - Supabase Client Setup
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Artwork,
  ArtworkFilters,
  CreateArtworkRequest,
  UpdateArtworkRequest,
  TimelineEntry,
  TimelineFilters,
  CreateTimelineEntryRequest,
  UpdateTimelineEntryRequest,
  Tag,
  SiteSettings,
  UploadMediaResponse,
  User,
} from './types';

// ============================================
// Initialize Supabase Client (Singleton)
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null;

export const supabase: SupabaseClient = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: '9f-universe-auth', // Unique storage key
      },
    });
  }
  return supabaseInstance;
})();

// ============================================
// Authentication
// ============================================

export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentUserProfile(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// Artworks API
// ============================================

export const artworks = {
  async list(filters: ArtworkFilters = {}) {
    console.log('artworks.list called with filters:', filters);
    
    // First, get artworks
    let query = supabase
      .from('artworks')
      .select('*');

    // Apply filters
    // Only filter by status if explicitly provided and not 'all'
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    // If status is 'all' or undefined, don't filter by status (admin can see all)

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.tags && filters.tags.length > 0) {
      // Filter by tags - need to use a different approach
      const { data: taggedArtworks } = await supabase
        .from('artwork_tags')
        .select('artwork_id')
        .in('tag_id', 
          await supabase
            .from('tags')
            .select('id')
            .in('slug', filters.tags)
            .then(res => res.data?.map(t => t.id) || [])
        );
      
      if (taggedArtworks && taggedArtworks.length > 0) {
        const artworkIds = taggedArtworks.map(t => t.artwork_id);
        query = query.in('id', artworkIds);
      } else {
        // No matches, return empty
        return [];
      }
    }

    if (filters.q) {
      // Full-text search - simplified for now
      query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    }

    // Ordering
    if (filters.order) {
      const [column, direction] = filters.order.split('.');
      query = query.order(column, { ascending: direction === 'asc' });
    } else {
      query = query.order('display_order', { ascending: true });
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: artworksData, error } = await query;
    console.log('artworks.list query result:', { 
      count: artworksData?.length || 0, 
      error: error?.message,
      sample: artworksData?.[0]
    });
    
    if (error) {
      console.error('artworks.list error:', error);
      throw error;
    }
    if (!artworksData || artworksData.length === 0) {
      console.log('artworks.list: No data returned');
      return [];
    }

    // Fetch media and tags separately for better reliability
    const artworkIds = artworksData.map(a => a.id);
    
    // Get media
    const { data: mediaData } = await supabase
      .from('artwork_media')
      .select('*')
      .in('artwork_id', artworkIds);

    // Get tags - use simpler query to avoid nested relation issues
    let tagRelations: any[] = [];
    let tagsData: any[] = [];
    
    if (artworkIds.length > 0) {
      const { data: tagRels } = await supabase
        .from('artwork_tags')
        .select('artwork_id, tag_id')
        .in('artwork_id', artworkIds);
      
      tagRelations = tagRels || [];
      
      const tagIds = tagRelations.map(tr => tr.tag_id);
      if (tagIds.length > 0) {
        const { data: tags } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds);
        tagsData = tags || [];
      }
    }

    // Combine data
    const artworks = artworksData.map(artwork => {
      const artworkTagIds = tagRelations
        ?.filter(tr => tr.artwork_id === artwork.id)
        .map(tr => tr.tag_id) || [];
      
      const artworkTags = tagsData?.filter(t => artworkTagIds.includes(t.id)) || [];

      return {
        ...artwork,
        media: mediaData?.filter(m => m.artwork_id === artwork.id) || [],
        tags: artworkTags,
      };
    });

    return artworks as Artwork[];
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        *,
        media:artwork_media(*),
        tags:artwork_tags(tag:tags(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Artwork;
  },

  async create(payload: CreateArtworkRequest) {
    const { tags, media, ...artworkData } = payload;

    // Create artwork
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .insert(artworkData)
      .select()
      .single();

    if (artworkError) throw artworkError;

    // Create tags relationships
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId) => ({
        artwork_id: artwork.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from('artwork_tags')
        .insert(tagRelations);

      if (tagsError) throw tagsError;
    }

    // Create media records
    if (media && media.length > 0) {
      const mediaRecords = media.map((m) => ({
        ...m,
        artwork_id: artwork.id,
      }));

      const { error: mediaError } = await supabase
        .from('artwork_media')
        .insert(mediaRecords);

      if (mediaError) throw mediaError;
    }

    return this.get(artwork.id);
  },

  async update(id: string, payload: UpdateArtworkRequest) {
    const { tags, media, ...artworkData } = payload;

    // Update artwork
    const { error: artworkError } = await supabase
      .from('artworks')
      .update(artworkData)
      .eq('id', id);

    if (artworkError) throw artworkError;

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await supabase.from('artwork_tags').delete().eq('artwork_id', id);

      // Insert new tags
      if (tags.length > 0) {
        const tagRelations = tags.map((tagId) => ({
          artwork_id: id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('artwork_tags')
          .insert(tagRelations);

        if (tagsError) throw tagsError;
      }
    }

    return this.get(id);
  },

  async delete(id: string) {
    // Soft delete: set status to archived
    const { error } = await supabase
      .from('artworks')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  async publish(id: string) {
    const { error } = await supabase
      .from('artworks')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async unpublish(id: string) {
    const { error } = await supabase
      .from('artworks')
      .update({ status: 'draft' })
      .eq('id', id);

    if (error) throw error;
  },

  async reorder(items: Array<{ id: string; display_order: number }>) {
    // Batch update display_order
    const updates = items.map((item) =>
      supabase
        .from('artworks')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) throw errors[0].error;
  },
};

// ============================================
// Timeline API
// ============================================

export const timeline = {
  async list(filters: TimelineFilters = {}) {
    console.log('timeline.list called with filters:', filters);
    let query = supabase.from('timeline_entries').select('*');

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.order) {
      const [column, direction] = filters.order.split('.');
      query = query.order(column, { ascending: direction === 'asc' });
    } else {
      query = query.order('display_order', { ascending: true });
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    console.log('timeline.list result:', { count: data?.length || 0, error: error?.message });
    if (error) throw error;
    return data as TimelineEntry[];
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as TimelineEntry;
  },

  async create(payload: CreateTimelineEntryRequest) {
    const { data, error } = await supabase
      .from('timeline_entries')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as TimelineEntry;
  },

  async update(id: string, payload: UpdateTimelineEntryRequest) {
    const { error } = await supabase
      .from('timeline_entries')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return this.get(id);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('timeline_entries')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  async reorder(items: Array<{ id: string; display_order: number }>) {
    const updates = items.map((item) =>
      supabase
        .from('timeline_entries')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) throw errors[0].error;
  },
};

// ============================================
// Tags API
// ============================================

export const tags = {
  async list() {
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) throw error;
    return data as Tag[];
  },

  async create(payload: { name: string; slug: string; color?: string }) {
    const { data, error } = await supabase
      .from('tags')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async update(id: string, payload: Partial<Tag>) {
    const { error } = await supabase.from('tags').update(payload).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// Site Settings API
// ============================================

export const settings = {
  async get(key: string) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data as SiteSettings;
  },

  async getAll() {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    return data as SiteSettings[];
  },

  async update(key: string, value: Record<string, unknown>) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) throw error;
  },
};

// ============================================
// Media Upload API
// ============================================

export const media = {
  async upload(file: File, folder: string = 'artwork-media'): Promise<UploadMediaResponse> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('artwork-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('artwork-media').getPublicUrl(fileName);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;

    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.src = publicUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          width = img.width;
          height = img.height;
          resolve(null);
        };
      });
    }

    return {
      url: publicUrl,
      storage_key: fileName,
      width,
      height,
      file_size: file.size,
    };
  },

  async delete(storageKey: string) {
    const { error } = await supabase.storage
      .from('artwork-media')
      .remove([storageKey]);

    if (error) throw error;
  },
};
