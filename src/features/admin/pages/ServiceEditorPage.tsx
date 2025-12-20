import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useServices, useService, useCreateService, useUpdateService } from '@/hooks/useServices';
import { media } from '@/services/api/supabase';
import type { CreateServiceRequest, ServiceStatus } from '@/services/api/types';
import { AdminButton, AdminPageHeader, AdminCard, AdminInput, AdminRichTextEditor } from '@/features/admin/components/ui';

export const ServiceEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: services, isLoading: isLoadingServices } = useServices();
    const { data: service, isLoading: isLoadingService } = useService(!isNew && id ? id : '');
    const createMutation = useCreateService();
    const updateMutation = useUpdateService();

    const [formData, setFormData] = useState<Partial<CreateServiceRequest>>({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: 0,
        status: 'published',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        console.log('ServiceEditorPage useEffect:', { id, isNew, service: !!service, services: services?.length });
        if (!isNew && service) {
            console.log('Pre-filling form with service data:', service);
            setFormData({
                name: service.name,
                slug: service.slug,
                description: service.description || '',
                image_url: service.image_url || '',
                display_order: service.display_order,
                status: service.status,
            });
            setPreviewUrl(service.image_url || null);
        } else if (isNew && services) {
            setFormData(prev => ({
                ...prev,
                display_order: services.length + 1
            }));
        }
    }, [id, isNew, service, services]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setImageFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, image_url: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            let finalImageUrl = formData.image_url;

            if (imageFile) {
                const { url } = await media.upload(imageFile, 'services');
                finalImageUrl = url;
            }

            const payload = {
                ...formData,
                image_url: finalImageUrl,
            };

            if (isNew) {
                await createMutation.mutateAsync(payload as CreateServiceRequest);
            } else if (id) {
                await updateMutation.mutateAsync({
                    id,
                    payload,
                });
            }
            navigate('/admin/services');
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if ((isLoadingServices || isLoadingService) && !isNew) {
        return <div className="p-12 text-center text-gray-400 font-mono italic">Loading service data...</div>;
    }

    return (
        <div className="p-12 max-w-4xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest mb-4 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Services
                </button>
                <AdminPageHeader
                    title={isNew ? 'Create Service' : 'Edit Service'}
                    subtitle={isNew ? 'Define a new service offering' : `Editing: ${formData.name}`}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-8">
                    <AdminCard title="Service Information">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Service Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const slug = name
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/^-+|-+$/g, '');
                                        setFormData({ ...formData, name, slug });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:border-white focus:outline-none focus:bg-white/10 transition-all font-bold uppercase tracking-tight"
                                    required
                                    placeholder="e.g. WEB3 DEVELOPMENT"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Slug (Auto-generated)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    readOnly
                                    className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-lg cursor-not-allowed opacity-75 font-mono text-gray-400"
                                />
                            </div>

                            <div className="min-h-[400px]">
                                <AdminRichTextEditor
                                    label="Description"
                                    value={formData.description || ''}
                                    onChange={(content) => setFormData({ ...formData, description: content })}
                                    placeholder="Describe this service..."
                                    height="350px"
                                />
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard title="Media & Display">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">Service Media (Image/Video)</label>
                                <div className="relative border border-dashed border-white/20 rounded-xl p-8 hover:border-white/40 transition-colors group bg-white/5 text-center">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleImageSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    {previewUrl ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/50">
                                            {previewUrl.match(/\.(mp4|webm|mov)$/i) || previewUrl.includes('/video/upload/') || imageFile?.type.startsWith('video/') ? (
                                                <video
                                                    src={previewUrl}
                                                    className="w-full h-full object-contain"
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    controls
                                                />
                                            ) : (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
                                                <Upload className="text-white" size={24} />
                                                <span className="text-white font-mono text-xs uppercase tracking-widest font-bold">Change Media</span>
                                            </div>
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all z-20 pointer-events-auto shadow-xl"
                                                title="Remove media"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold">Click or Drag to upload media</span>
                                            <p className="text-[10px] text-gray-500 mt-2 lowercase">Recommended size: 800x600px</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:border-white focus:outline-none focus:bg-white/10 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:border-white focus:outline-none focus:bg-white/10 transition-all uppercase font-mono text-xs tracking-widest font-bold"
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                <div className="mt-12 flex gap-4">
                    <AdminButton
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-4"
                        icon={isSaving ? undefined : <Save size={20} />}
                    >
                        {isSaving ? 'Saving Changes...' : 'Save Service'}
                    </AdminButton>
                    <AdminButton
                        variant="secondary"
                        onClick={() => navigate('/admin/services')}
                        type="button"
                        className="px-8"
                    >
                        Cancel
                    </AdminButton>
                </div>
            </form>
        </div>
    );
};
