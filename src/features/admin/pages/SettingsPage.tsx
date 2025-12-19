import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { media } from '@/services/api/supabase';
import type { Service, ServiceStatus, CreateServiceRequest } from '@/services/api/types';

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'services'>('services');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="p-8 cursor-auto">
            <div className="mb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Services</h1>
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                    Manage site services
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-3 font-mono uppercase text-sm tracking-wider transition-colors ${activeTab === 'services'
                        ? 'border-b-2 border-white text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Services
                </button>
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <ServicesTab
                    editingService={editingService}
                    setEditingService={setEditingService}
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                />
            )}
        </div>
    );
};

interface ServicesTabProps {
    editingService: Service | null;
    setEditingService: (service: Service | null) => void;
    isCreating: boolean;
    setIsCreating: (value: boolean) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
    editingService,
    setEditingService,
    isCreating,
    setIsCreating,
}) => {
    const { data: services, isLoading, error } = useServices({ order: 'display_order.asc' });
    const createMutation = useCreateService();
    const updateMutation = useUpdateService();
    const deleteMutation = useDeleteService();

    const [formData, setFormData] = useState<Partial<CreateServiceRequest>>({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: 0,
        status: 'published',
    });

    // File upload states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            slug: service.slug,
            description: service.description || '',
            image_url: service.image_url || '',
            display_order: service.display_order,
            status: service.status,
        });
        setPreviewUrl(service.image_url || null);
        setImageFile(null);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingService(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image_url: '',
            display_order: (services?.length || 0) + 1,
            status: 'published',
        });
        setPreviewUrl(null);
        setImageFile(null);
    };

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
            setIsUploading(true);
            let finalImageUrl = formData.image_url;

            // Upload image if selected
            if (imageFile) {
                const { url } = await media.upload(imageFile, 'services');
                finalImageUrl = url;
            }

            const payload = {
                ...formData,
                image_url: finalImageUrl,
            };

            if (isCreating) {
                await createMutation.mutateAsync(payload as CreateServiceRequest);
            } else if (editingService) {
                await updateMutation.mutateAsync({
                    id: editingService.id,
                    payload: payload,
                });
            }

            setIsCreating(false);
            setEditingService(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                image_url: '',
                display_order: 0,
                status: 'published',
            });
            setImageFile(null);
            setPreviewUrl(null);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this service?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error: any) {
                alert(`Delete failed: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingService(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image_url: '',
            display_order: 0,
            status: 'published',
        });
        setImageFile(null);
        setPreviewUrl(null);
    };

    if (isLoading) {
        return <div className="text-center py-12 text-gray-400">Loading services...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-2">Error loading services</p>
                <p className="text-gray-400 text-sm font-mono">{(error as any).message}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold uppercase">Services List</h2>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-white text-black font-mono uppercase text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Service
                    </button>
                </div>

                <div className="space-y-3">
                    {services && services.length > 0 ? (
                        services.map((service, idx) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between ${editingService?.id === service.id ? 'ring-2 ring-white' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <GripVertical size={16} className="text-gray-500 cursor-grab" />
                                    <div className="flex-1">
                                        <div className="font-bold uppercase">{service.name}</div>
                                        <div className="text-sm text-gray-400 font-mono">
                                            {service.slug} • Order: {service.display_order}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs font-mono uppercase ${service.status === 'published'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                            }`}
                                    >
                                        {service.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p className="mb-2">No services yet</p>
                            <button
                                onClick={handleCreate}
                                className="text-white underline hover:no-underline"
                            >
                                Create your first service
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Form */}
            <div>
                <h2 className="text-2xl font-bold uppercase mb-6">
                    {isCreating ? 'Create Service' : editingService ? 'Edit Service' : 'Select a Service'}
                </h2>

                {(isCreating || editingService) ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">Name *</label>
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
                                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">Slug *</label>
                            <input
                                type="text"
                                value={formData.slug}
                                readOnly
                                className="w-full bg-black/50 border border-white/10 px-4 py-2 cursor-not-allowed opacity-75 font-mono text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none h-24"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">Service Image</label>

                            <div className="relative border border-dashed border-white/20 rounded-lg p-4 hover:border-white/40 transition-colors group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                {previewUrl ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded bg-black/50">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
                                            <Upload className="text-white" size={24} />
                                            <span className="text-white font-mono text-sm uppercase">Change Image</span>
                                        </div>
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors z-20 pointer-events-auto"
                                            title="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400 pointer-events-none">
                                        <Upload className="mx-auto mb-2" size={24} />
                                        <span className="text-sm font-mono uppercase">Click or Drag to upload image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">
                                Display Order <span className="text-gray-500 text-xs normal-case ml-2">(Lower numbers appear first)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase mb-2">
                                Status <span className="text-gray-500 text-xs normal-case ml-2">(Draft/Published/Archived)</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                                className="w-full bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none"
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 px-6 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-white/20 font-mono uppercase hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>Select a service to edit or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};
