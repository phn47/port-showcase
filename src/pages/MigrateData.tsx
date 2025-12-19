import React, { useState } from 'react';
import { supabase } from '@/services/api/supabase';
import { illustrations } from '@/data/illustrations';
import { logos } from '@/data/logos';
import { banners } from '@/data/banners';
import { animations } from '@/data/animations';
import { gifs } from '@/data/gifs';
import { animatedStickers } from '@/data/animatedStickers';
import { stickers } from '@/data/stickers';
import { socialMedia } from '@/data/socialMedia';
import { comics } from '@/data/comics';
import { nfts } from '@/data/nfts';
import { memes } from '@/data/memes';

// Combine all raw data
const allRawData = [
  ...illustrations,
  ...logos,
  ...banners,
  ...animations,
  ...gifs,
  ...animatedStickers,
  ...stickers,
  ...socialMedia,
  ...comics,
  ...nfts,
  ...memes,
];

// Helper functions
function generateSlug(id: string, title?: string): string {
  const base = title || id;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractYear(metadata: any): number | null {
  if (metadata?.created) {
    const year = parseInt(metadata.created);
    if (!isNaN(year) && year >= 2000 && year <= 2100) {
      return year;
    }
  }
  return null;
}

function parseFileSize(fileSize: string): number | null {
  if (!fileSize || fileSize === 'Unknown') return null;
  const match = fileSize.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'KB') return Math.round(value * 1024);
  if (unit === 'MB') return Math.round(value * 1024 * 1024);
  if (unit === 'GB') return Math.round(value * 1024 * 1024 * 1024);
  return null;
}

const categoryMap: Record<string, string> = {
  'Illustration': 'Illustration',
  'Logo': 'Logo',
  'Banner': 'Banner',
  'Animation': 'Animation',
  'GIF': 'GIF',
  'Animated Sticker': 'Animated Sticker',
  'Sticker': 'Sticker',
  'Social Media': 'Social Media',
  'Comic': 'Comic',
  'NFT': 'NFT',
  'Meme': 'Meme',
};

export const MigrateDataPage: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs((prev) => [...prev, logMessage]);
    console.log(logMessage);
  };

  const getOrCreateTag = async (name: string): Promise<string> => {
    const slug = generateSlug(name);
    
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return existing.id;
    }

    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        name: name,
        slug: slug,
        color: '#000000',
      })
      .select('id')
      .single();

    if (error) throw error;
    return newTag.id;
  };

  const importArtwork = async (asset: any, index: number) => {
    try {
      const category = categoryMap[asset.category] || 'Illustration';
      const title = asset.alt_text 
        ? asset.alt_text.substring(0, 100)
        : asset.id.replace(/-/g, ' ').replace(/\d+/g, '').trim() || `Artwork ${index + 1}`;
      
      const slug = generateSlug(asset.id, title);
      const description = asset.alt_text || null;
      const year = extractYear(asset.metadata);
      const dimensions = asset.dimensions 
        ? `${asset.dimensions.width}x${asset.dimensions.height}`
        : null;

      // Check if exists
      const { data: existing } = await supabase
        .from('artworks')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
        addLog(`⏭️  Skipped: ${title.substring(0, 50)}...`, 'warning');
        return existing.id;
      }

      // Create artwork
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .insert({
          title: title,
          slug: slug,
          description: description,
          category: category,
          year: year,
          medium: asset.style || 'Digital',
          dimensions: dimensions,
          status: 'published',
          featured: false,
          display_order: index,
          metadata: {
            format: asset.format,
            colorMode: asset.colorMode,
            colorPalette: asset.colorPalette || [],
            keywords: asset.keywords || [],
            ...(asset.metadata || {}),
          },
        })
        .select('id')
        .single();

      if (artworkError) throw artworkError;

      setStats((prev) => ({ ...prev, imported: prev.imported + 1 }));
      addLog(`✅ [${index + 1}/${allRawData.length}] ${title.substring(0, 50)}...`, 'success');

      // Create tags
      if (asset.tags && Array.isArray(asset.tags) && asset.tags.length > 0) {
        const tagIds: string[] = [];
        for (const tagName of asset.tags) {
          try {
            const tagId = await getOrCreateTag(tagName);
            tagIds.push(tagId);
          } catch (error) {
            // Silent fail
          }
        }

        if (tagIds.length > 0) {
          const tagRelations = tagIds.map((tagId) => ({
            artwork_id: artwork.id,
            tag_id: tagId,
          }));

          await supabase.from('artwork_tags').insert(tagRelations);
        }
      }

      // Create media
      const isVideo = asset.image_url?.toLowerCase().match(/\.(mp4|webm|mov)$/);
      const fileSize = parseFileSize(asset.fileSize);
      
      await supabase.from('artwork_media').insert({
        artwork_id: artwork.id,
        type: isVideo ? 'video' : 'image',
        url: asset.image_url,
        storage_key: asset.image_url,
        width: asset.dimensions?.width || null,
        height: asset.dimensions?.height || null,
        file_size: fileSize || null,
        alt_text: asset.alt_text || null,
        dominant_color: asset.colorPalette?.[0] || null,
        display_order: 0,
        is_primary: true,
      });

      return artwork.id;
    } catch (error: any) {
      setStats((prev) => ({ ...prev, errors: prev.errors + 1 }));
      addLog(`❌ ${asset.id}: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setStats({ total: allRawData.length, imported: 0, skipped: 0, errors: 0 });
    setLogs([]);
    addLog(`🚀 Starting migration of ${allRawData.length} items...`, 'info');

    try {
      for (let i = 0; i < allRawData.length; i++) {
        const asset = allRawData[i];
        try {
          await importArtwork(asset, i);
          
          // Small delay every 10 items
          if (i % 10 === 0 && i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          // Already logged
        }
      }

      addLog(`\n✅ Migration complete!`, 'success');
      addLog(`   Imported: ${stats.imported}`, 'success');
      addLog(`   Skipped: ${stats.skipped}`, 'warning');
      addLog(`   Errors: ${stats.errors}`, stats.errors > 0 ? 'error' : 'info');
    } catch (error: any) {
      addLog(`❌ Migration failed: ${error.message}`, 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📦 Data Migration</h1>
        
        <div className="mb-8">
          <p className="text-gray-400 mb-4">
            Migrate {allRawData.length} items from static data to Supabase
          </p>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMigrating ? '⏳ Migrating...' : '🚀 Start Migration'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400 mt-2">Total</div>
          </div>
          <div className="bg-gray-900 p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-500">{stats.imported}</div>
            <div className="text-sm text-gray-400 mt-2">Imported</div>
          </div>
          <div className="bg-gray-900 p-4 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-500">{stats.skipped}</div>
            <div className="text-sm text-gray-400 mt-2">Skipped</div>
          </div>
          <div className="bg-gray-900 p-4 border border-gray-700">
            <div className="text-3xl font-bold text-red-500">{stats.errors}</div>
            <div className="text-sm text-gray-400 mt-2">Errors</div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 max-h-96 overflow-y-auto">
          <div className="space-y-1 text-sm">
            {logs.map((log, i) => (
              <div key={i} className={log.includes('✅') ? 'text-green-500' : log.includes('❌') ? 'text-red-500' : log.includes('⏭️') ? 'text-yellow-500' : 'text-gray-300'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
