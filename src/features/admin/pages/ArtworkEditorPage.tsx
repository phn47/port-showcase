import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtwork, useCreateArtwork, useUpdateArtwork } from '@/hooks/useArtworks';
import { useTags } from '@/hooks/useTags';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import type { ArtworkCategory, CreateArtworkRequest } from '@/services/api/types';

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
    year: undefined,
    medium: 'Digital',
    dimensions: '',
    status: 'draft',
    featured: false,
    display_order: 0,
    tags: [],
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; file?: File }>>([]);

  useEffect(() => {
    if (artwork && !isNew) {
      setFormData({
        title: artwork.title,
        slug: artwork.slug,
        description: artwork.description || '',
        category: artwork.category,
        year: artwork.year || undefined,
        medium: artwork.medium || 'Digital',
        dimensions: artwork.dimensions || '',
        status: artwork.status,
        featured: artwork.featured,
        display_order: artwork.display_order,
      });
      setSelectedTags(artwork.tags?.map(t => t.id) || []);
      setMediaFiles(
        artwork.media?.map(m => ({ url: m.url })) || []
      );
    }
  }, [artwork, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateArtworkRequest = {
        ...formData,
        tags: selectedTags,
        media: mediaFiles.map((m, idx) => ({
          url: m.url,
          storage_key: m.url,
          type: m.url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
          is_primary: idx === 0,
          display_order: idx,
          alt_text: formData.description || '',
        })),
      } as CreateArtworkRequest;

      if (isNew) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({ id: id!, payload });
      }

      navigate('/admin/artworks');
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
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
                    {media.url.match(/\.(mp4|webm|mov)$/i) ? (
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ArtworkCategory })}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none uppercase"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm uppercase tracking-wider mb-2">Year</label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wider mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none uppercase"
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
              </label>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold uppercase mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded text-sm font-mono uppercase transition-colors ${
                      selectedTags.includes(tag.id)
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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
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
