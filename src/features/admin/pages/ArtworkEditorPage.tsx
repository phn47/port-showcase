import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtwork, useCreateArtwork, useUpdateArtwork } from '@/hooks/useArtworks';
import { useTags } from '@/hooks/useTags';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import type { ArtworkCategory, CreateArtworkRequest } from '@/services/api/types';
import { media } from '@/services/api/supabase';

const CATEGORIES: ArtworkCategory[] = [
  'Illustration',
  'Animation',
  'Logo',
  'Banner',
  'NFT',
  'Meme',
  'Sticker',
  'Animated Sticker',
  'GIF',
  'Social Media',
  'Comic',
];

export const ArtworkEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: artwork, isLoading: isLoadingArtwork } = useArtwork(id || '');
  const { data: tags } = useTags();
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();

  const [formData, setFormData] = useState<Partial<CreateArtworkRequest>>({
    title: '',
    slug: '',
    description: '',
    category: 'Illustration',
    medium: 'Digital',
    dimensions: '',
    status: 'draft',
    featured: false,
    display_order: 0,
    tags: [],
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; file?: File }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (artwork && !isNew) {
      setFormData({
        title: artwork.title,
        slug: artwork.slug,
        description: artwork.description || '',
        category: artwork.category,
        medium: artwork.medium || 'Digital',
        dimensions: artwork.dimensions || '',
        status: artwork.status,
        featured: artwork.featured,
        display_order: artwork.display_order,
      });
      // Supabase returns tags nested in the join table: { tag: { id, name, ... } }
      // But the type expectation is Tag[]
      // We need to handle both cases to be safe
      const tagIds = artwork.tags?.map((t: any) => t.tag?.id || t.id).filter(Boolean) || [];
      console.log('Loading artwork tags:', { tags: artwork.tags, tagIds });
      setSelectedTags(tagIds);
      setMediaFiles(
        artwork.media?.map(m => ({ url: m.url })) || []
      );
    }
  }, [artwork, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    try {
      setIsUploading(true);
      // Filter out any null/undefined tags
      const validTags = selectedTags.filter(tagId => tagId != null && tagId !== '');

      console.log('Saving artwork with tags:', { selectedTags, validTags });

      // Clean up Display Order (ensure it's a number and non-negative)
      const cleanDisplayOrder = Math.max(0, Number(formData.display_order) || 0);

      // Process media files (upload if new)
      const processedMedia = await Promise.all(mediaFiles.map(async (m, idx) => {
        let finalUrl = m.url;
        let finalType = 'image';

        // Check type from file if available, otherwise guess from extension
        if (m.file) {
          console.log('Starting upload for:', m.file.name);
          finalType = m.file.type.startsWith('video/') ? 'video' : 'image';
          // Upload new file
          try {
            const { url } = await media.upload(m.file);
            console.log('Upload success:', url);
            finalUrl = url;
          } catch (uploadError) {
            console.error('Failed to upload file:', m.file.name, uploadError);
            throw new Error(`Failed to upload ${m.file.name}`);
          }
        } else {
          finalType = finalUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? 'video' : 'image';
        }

        return {
          url: finalUrl,
          storage_key: finalUrl,
          type: finalType,
          is_primary: idx === 0,
          display_order: idx,
          alt_text: formData.description || '',
        };
      }));

      const payload: CreateArtworkRequest = {
        ...formData,
        display_order: cleanDisplayOrder,
        tags: validTags,
        media: processedMedia,
      } as CreateArtworkRequest;

      if (isNew) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({ id: id!, payload });
      }

      navigate('/admin/artworks');
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaFiles(prev => [...prev, { url, file }]);
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return newFiles;
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!isNew && isLoadingArtwork) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 cursor-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/artworks"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-mono text-sm uppercase">Back to Artworks</span>
        </Link>
        <h1 className="text-5xl font-black uppercase tracking-tighter">
          {isNew ? 'New Artwork' : 'Edit Artwork'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Upload */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold uppercase mb-4">Media</h2>
            <div className="space-y-4">
              {mediaFiles.map((media, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-white/5 rounded overflow-hidden">
                    {(media.file?.type.startsWith('video/') || media.url.match(/\.(mp4|webm|mov)$/i)) ? (
                      <video src={media.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={media.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 p-2 bg-black/80 text-white rounded hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-white text-xs font-mono uppercase">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleAddMedia}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <div className="font-mono text-sm uppercase text-gray-400">
                    Click to upload media
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold uppercase mb-4">Details</h2>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  setFormData({ ...formData, title, slug });
                }}
                required
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Slug *
                <span className="text-xs text-gray-400 normal-case ml-2">(Auto-generated from title)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full bg-black/50 border border-white/20 px-4 py-2 font-mono text-sm rounded cursor-not-allowed opacity-75"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ArtworkCategory })}
                className="w-full bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none uppercase rounded"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Display Order
                <span className="text-xs text-gray-400 normal-case ml-2">(Lower numbers appear first)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Status
                <span className="text-xs text-gray-400 normal-case ml-2">(Draft/Published/Archived)</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none uppercase rounded"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm uppercase tracking-wider">
                Featured
                <span className="text-xs text-gray-400 normal-case ml-2">(Highlight this artwork)</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold uppercase mb-4">
                Tags
                {selectedTags.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">({selectedTags.length} selected)</span>
                )}
              </h2>

              {/* Search */}
              <input
                type="text"
                placeholder="Search tags..."
                onChange={(e) => {
                  const search = e.target.value.toLowerCase();
                  const container = document.getElementById('tags-container');
                  if (container) {
                    const buttons = container.querySelectorAll('button');
                    buttons.forEach(btn => {
                      const text = btn.textContent?.toLowerCase() || '';
                      (btn as HTMLElement).style.display = text.includes(search) ? '' : 'none';
                    });
                  }
                }}
                className="w-full bg-black border border-white/20 px-4 py-2 mb-4 focus:border-white focus:outline-none font-mono text-sm rounded"
              />

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mb-4 p-3 bg-black/50 border border-white/10 rounded">
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Selected:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="px-2 py-1 bg-white text-black rounded text-xs font-mono uppercase hover:bg-gray-200 transition-colors"
                        >
                          {tag.name} ×
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* All Tags */}
              <div id="tags-container" className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 bg-black/30 rounded">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded text-sm font-mono uppercase transition-colors ${selectedTags.includes(tag.id)
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              {isUploading ? 'Uploading Media...' : (createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save')}
            </button>
            {!isNew && formData.status === 'published' && (
              <Link
                to={`/?artwork=${formData.slug}`}
                target="_blank"
                className="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Eye size={20} />
                Preview
              </Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
