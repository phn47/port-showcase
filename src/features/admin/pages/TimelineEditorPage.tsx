import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTimelineEntry, useCreateTimelineEntry, useUpdateTimelineEntry } from '@/hooks/useTimeline';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { media } from '@/services/api/supabase';
import type { CreateTimelineEntryRequest } from '@/services/api/types';

export const TimelineEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: entry, isLoading: isLoadingEntry } = useTimelineEntry(id && !isNew ? id : '');
    const createMutation = useCreateTimelineEntry();
    const updateMutation = useUpdateTimelineEntry();

    const [formData, setFormData] = useState<Partial<CreateTimelineEntryRequest>>({
        title: '',
        date_label: '',
        body: '',
        display_order: 0,
        status: 'draft',
        media_url: '',
        media_alt: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (entry && !isNew) {
            setFormData({
                title: entry.title,
                date_label: entry.date_label,
                body: entry.body || '',
                display_order: entry.display_order,
                status: entry.status,
                media_url: entry.media_url || '',
                media_alt: entry.media_alt || '',
            });
            if (entry.media_url) {
                setPreviewUrl(entry.media_url);
            }
        }
    }, [entry, isNew]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Clear current media_url in form data (will be replaced by upload)
            setFormData(prev => ({ ...prev, media_url: '' }));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, media_url: '' }));
        const input = document.getElementById('timeline-image') as HTMLInputElement;
        if (input) input.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) return;

        try {
            setIsUploading(true);

            let finalMediaUrl = formData.media_url;

            // Upload image if selected
            if (imageFile) {
                try {
                    const { url } = await media.upload(imageFile, 'timeline');
                    finalMediaUrl = url;
                } catch (uploadError: any) {
                    console.error('Failed to upload image:', uploadError);
                    throw new Error('Image upload failed: ' + uploadError.message);
                }
            }

            const payload = {
                title: formData.title!,
                date_label: formData.date_label!,
                display_order: Number(formData.display_order) || 0,
                status: formData.status || 'draft',
                body: formData.body || '',
                media_url: finalMediaUrl || '',
                media_alt: formData.media_alt || formData.title || '',
                metadata: {},
            } as CreateTimelineEntryRequest;

            console.log('Submitting payload:', payload);

            if (isNew) {
                await createMutation.mutateAsync(payload);
            } else {
                await updateMutation.mutateAsync({ id: id!, payload });
            }

            navigate('/admin/timeline');
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingEntry && !isNew) {
        return <div className="p-8 text-center text-gray-400">Loading entry...</div>;
    }

    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto">
            <Link to="/admin/timeline" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Timeline
            </Link>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter">
                    {isNew ? 'New Entry' : 'Edit Entry'}
                </h1>
                {formData.status && (
                    <div className={`px-3 py-1 text-sm font-mono uppercase border ${formData.status === 'published' ? 'border-green-500 text-green-500' :
                            formData.status === 'archived' ? 'border-red-500 text-red-500' :
                                'border-yellow-500 text-yellow-500'
                        }`}>
                        {formData.status}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black border-b border-white/20 py-2 text-xl font-bold focus:border-white focus:outline-none placeholder-gray-700"
                                placeholder="Ex: PROJECT LAUNCH"
                                required
                            />
                        </div>

                        {/* Date Label */}
                        <div>
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Date / Period</label>
                            <input
                                type="text"
                                value={formData.date_label}
                                onChange={e => setFormData({ ...formData, date_label: e.target.value })}
                                className="w-full bg-black border-b border-white/20 py-2 text-lg focus:border-white focus:outline-none placeholder-gray-700 font-mono"
                                placeholder="Ex: DEC 2025"
                                required
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Description</label>
                            <textarea
                                value={formData.body || ''}
                                onChange={e => setFormData({ ...formData, body: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded p-4 h-48 focus:border-white focus:outline-none transition-colors"
                                placeholder="Describe this milestone..."
                            />
                        </div>

                        {/* Media Upload */}
                        <div>
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Media (Optional)</label>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                {previewUrl ? (
                                    <div className="relative aspect-video bg-black/50 rounded overflow-hidden group">
                                        {/* Check media type for preview */}
                                        {(imageFile?.type.startsWith('video/') || previewUrl.match(/\.(mp4|webm|mov)$/i)) ? (
                                            <video src={previewUrl} className="w-full h-full object-cover" controls />
                                        ) : (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="aspect-video border-2 border-dashed border-white/10 rounded flex flex-col items-center justify-center text-gray-500 hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer"
                                        onClick={() => document.getElementById('timeline-image')?.click()}
                                    >
                                        <Upload size={32} className="mb-2" />
                                        <span className="text-xs font-mono uppercase">Click to upload image or video</span>
                                    </div>
                                )}
                                <input
                                    id="timeline-image"
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Settings */}
                    <div className="space-y-6">

                        {/* Status */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-black border border-white/20 px-3 py-2 focus:border-white focus:outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Display Order */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Display Order</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                className="w-full bg-black border border-white/20 px-3 py-2 focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                Lower numbers appear first. Negative numbers allowed.
                            </p>
                        </div>

                        {/* Actions */}
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            <Save size={20} />
                            {isUploading ? 'Uploading...' : (createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Entry')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
