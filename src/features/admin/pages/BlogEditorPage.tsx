import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogPostById, useCreateBlogPost, useUpdateBlogPost } from '@/hooks/useBlog';
import { media } from '@/services/api/supabase';
import { ArrowLeft, Save, Upload, X, Globe, Eye } from 'lucide-react';
import { CreateBlogPostRequest } from '@/services/api/types';

export const BlogEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: post, isLoading } = useBlogPostById(id && !isNew ? id : '');
    const createMutation = useCreateBlogPost();
    const updateMutation = useUpdateBlogPost();

    const [formData, setFormData] = useState<Partial<CreateBlogPostRequest>>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        seo_title: '',
        seo_description: '',
        keywords: [],
        tags: [],
        cover_image: '',
    });

    const [keywordInput, setKeywordInput] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize form
    useEffect(() => {
        if (post && !isNew) {
            setFormData({
                title: post.title,
                slug: post.slug,
                content: post.content || '',
                excerpt: post.excerpt || '',
                status: post.status,
                seo_title: post.seo_title || '',
                seo_description: post.seo_description || '',
                keywords: post.keywords || [],
                tags: post.tags || [],
                cover_image: post.cover_image || '',
            });
            if (post.cover_image) setCoverPreview(post.cover_image);
        }
    }, [post, isNew]);

    // Auto-generate slug from title if new
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: isNew && !prev.slug ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
            // Clear URL so we know to upload
            setFormData(prev => ({ ...prev, cover_image: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) return;

        try {
            setIsUploading(true);
            let finalCoverUrl = formData.cover_image;

            if (coverFile) {
                const { url } = await media.upload(coverFile, 'blog-covers');
                finalCoverUrl = url;
            }

            const payload: CreateBlogPostRequest = {
                title: formData.title!,
                slug: formData.slug || formData.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                content: formData.content,
                excerpt: formData.excerpt,
                status: formData.status as any,
                cover_image: finalCoverUrl,
                seo_title: formData.seo_title,
                seo_description: formData.seo_description,
                keywords: formData.keywords,
                tags: formData.tags, // Can add tag input later
                featured: false,
                display_order: 0,
            };

            if (isNew) {
                await createMutation.mutateAsync(payload);
            } else {
                await updateMutation.mutateAsync({ id: id!, payload });
            }

            navigate('/admin/blog');
        } catch (error: any) {
            alert('Error saving post: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading && !isNew) return <div>Loading...</div>;

    return (
        <div className="p-8 pb-32 max-w-6xl mx-auto">
            <Link to="/admin/blog" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Blog
            </Link>

            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        {isNew ? 'New Post' : 'Edit Post'}
                    </h1>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            <Save size={20} />
                            {isUploading ? 'Uploading...' : 'Save Post'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Title */}
                        <div>
                            <input
                                type="text"
                                placeholder="Post Title"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full bg-transparent border-b border-white/20 py-4 text-4xl font-bold focus:border-white focus:outline-none placeholder-gray-700"
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                            <Globe size={14} />
                            <span>/blog/</span>
                            <input
                                type="text"
                                placeholder="url-slug"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="bg-transparent border-b border-white/10 focus:border-white focus:outline-none text-gray-300"
                            />
                        </div>

                        {/* Content Editor (Simple Textarea for now) */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex justify-between mb-2 text-xs text-gray-400 uppercase font-mono">
                                <span>Markdown Content</span>
                                <span>{formData.content?.length || 0} chars</span>
                            </div>
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full h-[600px] bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                                placeholder="# Write your masterpiece..."
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Excerpt (Short Summary)</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded p-4 h-24 focus:border-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-6">

                        {/* Status */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-black border border-white/20 px-3 py-2 focus:border-white focus:outline-none mb-4"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <label className="block text-gray-400 text-xs font-mono uppercase mb-2">Cover Image</label>
                            <div className="aspect-video bg-black/50 rounded overflow-hidden relative group border border-dashed border-white/10 hover:border-white/30 transition-colors">
                                {coverPreview ? (
                                    <>
                                        {coverPreview.match(/\.(mp4|webm|mov)$/i) || coverPreview.includes('/video/upload/') || coverFile?.type.startsWith('video/') ? (
                                            <video
                                                src={coverPreview}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                        ) : (
                                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setCoverFile(null); setCoverPreview(null); setFormData(p => ({ ...p, cover_image: '' })) }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded text-white opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 pointer-events-none">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs">Upload Cover</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageSelect}
                                    accept="image/*,video/*"
                                />
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
                            <h3 className="font-bold uppercase text-sm border-b border-white/10 pb-2">SEO Settings</h3>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-1">SEO Title</label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:border-white focus:outline-none"
                                    placeholder="Meta Title"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-1">SEO Description</label>
                                <textarea
                                    value={formData.seo_description}
                                    onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:border-white focus:outline-none h-20"
                                    placeholder="Meta Description"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-mono uppercase mb-1">Keywords</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.keywords?.map((kw, i) => (
                                        <span key={i} className="bg-white/10 px-2 py-1 text-xs rounded flex items-center gap-1">
                                            {kw}
                                            <button type="button" onClick={() => {
                                                const newKw = [...(formData.keywords || [])];
                                                newKw.splice(i, 1);
                                                setFormData({ ...formData, keywords: newKw });
                                            }}>
                                                <X size={10} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (keywordInput.trim()) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    keywords: [...(prev.keywords || []), keywordInput.trim()]
                                                }));
                                                setKeywordInput('');
                                            }
                                        }
                                    }}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:border-white focus:outline-none"
                                    placeholder="Add keyword + Enter"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
};
