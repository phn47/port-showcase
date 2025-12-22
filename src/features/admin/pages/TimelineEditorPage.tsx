import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTimelineEntry, useCreateTimelineEntry, useUpdateTimelineEntry } from '@/hooks/useTimeline';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { media } from '@/services/api/supabase';
import type { CreateTimelineEntryRequest, TimelineEntry } from '@/services/api/types';
import { AdminButton, AdminPageHeader, AdminCard } from '@/features/admin/components/ui';

interface TimelineEditorFormProps {
    initialData?: TimelineEntry;
    isNew: boolean;
    onSave: (payload: CreateTimelineEntryRequest) => void;
    isSaving: boolean;
}

const TimelineEditorForm: React.FC<TimelineEditorFormProps> = ({
    initialData,
    isNew,
    onSave,
    isSaving
}) => {
    const [formData, setFormData] = useState<CreateTimelineEntryRequest>({
        title: initialData?.title || '',
        date_label: initialData?.date_label || '',
        body: initialData?.body || '',
        display_order: initialData?.display_order || 0,
        status: (initialData?.status as any) || 'draft',
        media_url: initialData?.media_url || '',
        media_alt: initialData?.media_alt || '',
        metadata: initialData?.metadata || {},
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.media_url || null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, media_url: '' }));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, media_url: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalMediaUrl = formData.media_url;
        if (imageFile) {
            try {
                const { url } = await media.upload(imageFile, 'timeline');
                finalMediaUrl = url;
            } catch (error: any) {
                alert(`Upload Error: ${error.message}`);
                return;
            }
        }

        onSave({
            ...formData,
            media_url: finalMediaUrl || '',
            media_alt: formData.media_alt || formData.title,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <AdminCard title="Milestone Details">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-black border-b border-white/20 py-2 text-xl font-bold focus:border-white focus:outline-none placeholder-gray-700 text-white"
                                    placeholder="Ex: PROJECT LAUNCH"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Date / Period</label>
                                <input
                                    type="text"
                                    value={formData.date_label}
                                    onChange={e => setFormData(prev => ({ ...prev, date_label: e.target.value }))}
                                    className="w-full bg-black border-b border-white/20 py-2 text-lg focus:border-white focus:outline-none placeholder-gray-700 font-mono text-white"
                                    placeholder="Ex: DEC 2025"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Description</label>
                                <textarea
                                    value={formData.body || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                    className="w-full bg-black/30 border border-white/10 rounded p-4 h-48 focus:border-white focus:outline-none transition-colors text-white"
                                    placeholder="Describe this milestone..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2 text-white/60">Media (Optional)</label>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    {previewUrl ? (
                                        <div className="relative bg-black/50 rounded overflow-hidden group min-h-[200px] flex items-center justify-center">
                                            {(imageFile?.type.startsWith('video/') ||
                                                previewUrl.match(/\.(mp4|webm|mov)$/i) ||
                                                previewUrl.includes('/video/upload/')) ? (
                                                <video src={previewUrl} className="w-full h-auto max-h-[600px] object-contain" controls playsInline muted />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[600px] object-contain" />
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
                    </AdminCard>
                </div>

                <div className="space-y-6">
                    <AdminCard title="Settings">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                    className="w-full bg-black border border-white/20 px-3 py-2 focus:border-white focus:outline-none text-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={e => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                                    className="w-full bg-black border border-white/20 px-3 py-2 focus:border-white focus:outline-none text-white font-mono"
                                />
                                <p className="text-[10px] text-gray-500 mt-2">Lower numbers appear first.</p>
                            </div>

                            <AdminButton
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 text-base"
                                icon={!isSaving && <Save size={20} />}
                            >
                                {isSaving ? 'Saving...' : 'Save Entry'}
                            </AdminButton>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </form>
    );
};

export const TimelineEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: entry, isLoading, error } = useTimelineEntry(id && !isNew ? id : '');
    const createMutation = useCreateTimelineEntry();
    const updateMutation = useUpdateTimelineEntry();

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (payload: CreateTimelineEntryRequest) => {
        try {
            setIsSaving(true);
            if (isNew) {
                await createMutation.mutateAsync(payload);
            } else if (id) {
                await updateMutation.mutateAsync({ id, payload });
            }
            navigate('/admin/timeline');
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !isNew) {
        return <div className="p-8 text-center text-gray-400 font-mono italic animate-pulse">LOADING TIMELINE ENTRY...</div>;
    }

    if (error && !isNew) {
        return (
            <div className="p-8 text-center bg-black min-h-screen">
                <h2 className="text-xl font-bold text-white mb-4 uppercase">Error loading entry</h2>
                <p className="text-red-400 mb-6 font-mono text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
                <AdminButton onClick={() => navigate('/admin/timeline')}>Back to Timeline</AdminButton>
            </div>
        );
    }

    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto">
            <Link to="/admin/timeline" className="inline-flex items-center text-gray-400 hover:text-white mb-6 uppercase font-mono text-xs tracking-widest gap-2">
                <ArrowLeft size={16} /> Back to Timeline
            </Link>

            <div className="mb-12">
                <AdminPageHeader
                    title={isNew ? 'New Milestone' : 'Edit Milestone'}
                    subtitle={isNew ? 'Define a new event in your journey' : `Editing: ${entry?.title || ''}`}
                />
            </div>

            <TimelineEditorForm
                key={entry?.id || 'new'}
                initialData={entry}
                isNew={isNew}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </div>
    );
};
