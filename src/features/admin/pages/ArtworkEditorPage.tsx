import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtwork, useCreateArtwork, useUpdateArtwork } from '@/hooks/useArtworks';
import { useTags } from '@/hooks/useTags';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import type { ArtworkCategory, CreateArtworkRequest, Artwork, Tag } from '@/services/api/types';
import { media } from '@/services/api/supabase';
import { Button, PageHeader, Card } from '../components/ui';

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

interface ArtworkEditorFormProps {
  initialData?: Artwork;
  isNew: boolean;
  allTags?: Tag[];
  onSave: (payload: CreateArtworkRequest) => void;
  isSaving: boolean;
}

const ArtworkEditorForm: React.FC<ArtworkEditorFormProps> = ({
  initialData,
  isNew,
  allTags,
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState<Partial<CreateArtworkRequest>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: (initialData?.category as ArtworkCategory) || 'Illustration',
    medium: initialData?.medium || 'Digital',
    dimensions: initialData?.dimensions || '',
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    display_order: initialData?.display_order || 0,
  });

  // Supabase returns tags nested: { tag: { id, name } }. Map to string IDs
  const initialTagIds = initialData?.tags?.map((t: any) => t.tag?.id || t.id).filter(Boolean) || [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);

  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; file?: File }>>(
    initialData?.media?.map(m => ({ url: m.url })) || []
  );

  const [isUploading, setIsUploading] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
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
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    try {
      setIsUploading(true);

      // Process media files (upload new ones)
      const processedMedia = await Promise.all(mediaFiles.map(async (m, idx) => {
        let finalUrl = m.url;
        let finalType = 'image';

        if (m.file) {
          finalType = m.file.type.startsWith('video/') ? 'video' : 'image';
          const { url } = await media.upload(m.file);
          finalUrl = url;
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

      onSave({
        ...formData,
        tags: selectedTags.filter(Boolean),
        media: processedMedia,
      } as CreateArtworkRequest);

    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Media Section */}
        <Card title="Artwork Media">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mediaFiles.map((mediaItem, index) => (
                <div key={index} className="relative group aspect-square bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                  {(mediaItem.file?.type.startsWith('video/') || mediaItem.url.match(/\.(mp4|webm|mov)$/i)) ? (
                    <video src={mediaItem.url} className="w-full h-full object-contain" />
                  ) : (
                    <img src={mediaItem.url} alt="" className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {index === 0 && <span className="absolute top-2 left-2 px-2 py-0.5 bg-white text-[10px] font-black text-black uppercase rounded">Primary</span>}
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all text-gray-500">
                <input type="file" multiple accept="image/*,video/*" onChange={handleAddMedia} className="hidden" />
                <Upload size={32} className="mb-2" />
                <span className="text-[10px] font-mono uppercase font-bold">Add Media</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Details Section */}
        <Card title="Artwork Details">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:border-white focus:outline-none uppercase font-bold text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-lg text-gray-500 font-mono text-sm opacity-75"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:border-white focus:outline-none text-white"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Meta Settings */}
        <Card title="Classification">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as ArtworkCategory }))}
                className="w-full bg-black border border-white/20 px-4 py-2 text-white uppercase rounded-lg"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Medium</label>
              <input
                type="text"
                value={formData.medium}
                onChange={e => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                className="w-full bg-black border border-white/20 px-4 py-2 text-white rounded-lg"
                placeholder="e.g. Digital, Oil, Pencil"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] font-mono uppercase mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-black border border-white/20 px-4 py-2 text-white font-mono rounded-lg"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 rounded bg-black border-white/20"
              />
              <label htmlFor="featured" className="text-xs uppercase font-bold text-gray-300">Feature Artwork</label>
            </div>
          </div>
        </Card>

        {/* Tags Section */}
        <Card title="Tags">
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/10">
            {allTags?.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase transition-all ${selectedTags.includes(tag.id)
                  ? 'bg-white text-black font-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </Card>

        <div className="sticky bottom-8 space-y-4">
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full py-4 text-base"
            icon={!(isSaving || isUploading) && <Save size={20} />}
          >
            {isUploading ? 'Uploading Media...' : (isSaving ? 'Saving...' : 'Save Artwork')}
          </Button>
          {!isNew && (
            <Link to={`/?artwork=${formData.slug}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 hover:bg-white/5 transition-colors text-xs font-mono uppercase font-bold text-gray-400">
              <Eye size={16} /> Preview Live
            </Link>
          )}
        </div>
      </div>
    </form>
  );
};

export const ArtworkEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: artwork, isLoading, error } = useArtwork(id && !isNew ? id : '');
  const { data: tags } = useTags();
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (payload: CreateArtworkRequest) => {
    try {
      setIsSaving(true);
      if (isNew) {
        await createMutation.mutateAsync(payload);
      } else if (id) {
        await updateMutation.mutateAsync({ id, payload });
      }
      navigate('/admin/artworks');
    } catch (err: any) {
      alert(`Save Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !isNew) {
    return <div className="p-12 text-center font-mono text-gray-500 animate-pulse">LOADING PROJECT DATA...</div>;
  }

  if (error && !isNew) {
    return (
      <div className="p-12 text-center bg-black min-h-screen">
        <h2 className="text-2xl font-black uppercase text-white mb-6 tracking-tighter">System Error</h2>
        <p className="text-red-500 font-mono text-sm mb-8">{error instanceof Error ? error.message : 'Dữ liệu không phản hồi'}</p>
        <Button onClick={() => navigate('/admin/artworks')}>Back to Gallery</Button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <Link to="/admin/artworks" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors uppercase font-mono text-xs tracking-[0.2em]">
        <ArrowLeft size={16} /> Museum Gallery
      </Link>

      <div className="mb-12">
        <PageHeader
          title={isNew ? 'New Creation' : 'Curate Artwork'}
          subtitle={isNew ? 'Add a new masterpiece to your vault' : `Editing Piece: ${artwork?.title || ''}`}
        />
      </div>

      <ArtworkEditorForm
        key={artwork?.id || 'new'}
        initialData={artwork}
        isNew={isNew}
        allTags={tags}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};
