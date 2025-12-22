import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogPostById, useCreateBlogPost, useUpdateBlogPost } from '@/hooks/useBlog';
import { RichTextEditor } from '../components/ui';
import { Save, ArrowLeft, Image as ImageIcon, Eye, Globe, Sparkles, Tag } from 'lucide-react';
import type { CreateBlogPostRequest, BlogPost } from '@/services/api/types';
import { media } from '@/services/api/supabase';

// Sub-component to manage the form state, isolated from loading logic
interface BlogEditorFormProps {
    initialPost?: BlogPost;
    isNew: boolean;
    onSave: (data: CreateBlogPostRequest) => void;
    isSaving: boolean;
}

const BlogEditorForm: React.FC<BlogEditorFormProps> = ({ initialPost, isNew, onSave, isSaving }) => {
    const [formData, setFormData] = useState<CreateBlogPostRequest>({
        title: initialPost?.title || '',
        slug: initialPost?.slug || '',
        content: initialPost?.content || '',
        excerpt: initialPost?.excerpt || '',
        status: (initialPost?.status as any) || 'draft',
        seo_title: initialPost?.seo_title || '',
        seo_description: initialPost?.seo_description || '',
        keywords: Array.isArray(initialPost?.keywords) ? initialPost.keywords : [],
        tags: Array.isArray(initialPost?.tags) ? initialPost.tags : [],
        featured: initialPost?.featured || false,
        display_order: initialPost?.display_order || 0,
        cover_image: initialPost?.cover_image || '',
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(initialPost?.cover_image || null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isManualSlug, setIsManualSlug] = useState(!isNew);
    const [keywordInput, setKeywordInput] = useState('');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const generatedSlug = title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        setFormData(prev => ({
            ...prev,
            title,
            slug: isManualSlug ? prev.slug : generatedSlug
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const addKeyword = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault();
            if (!formData.keywords?.includes(keywordInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    keywords: [...(prev.keywords || []), keywordInput.trim()]
                }));
            }
            setKeywordInput('');
        }
    };

    const removeKeyword = (word: string) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords?.filter(k => k !== word)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle image upload first if there's a new file
        let uploadedUrl = formData.cover_image;
        if (coverFile) {
            try {
                const result = await media.upload(coverFile, 'blog');
                uploadedUrl = result.url;
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Failed to upload cover image');
                return;
            }
        }

        onSave({
            ...formData,
            cover_image: uploadedUrl
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    {isNew ? 'New Post' : 'Edit Post'}
                </h1>
                <div className="flex gap-4">
                    {!isNew && (
                        <Link
                            to={`/blog/${formData.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-mono uppercase tracking-widest text-white"
                        >
                            <Eye size={16} /> Preview
                        </Link>
                    )}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold uppercase text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Info */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
                        {/* Title */}
                        <div>
                            <input
                                type="text"
                                placeholder="Post Title"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full bg-transparent border-b border-white/20 py-4 text-4xl font-bold focus:border-white focus:outline-none placeholder-gray-700 text-white"
                                required
                            />
                        </div>

                        {/* Slug Link */}
                        <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
                            <Globe size={14} />
                            <span>/blog/</span>
                            <input
                                type="text"
                                placeholder="url-slug-placeholder"
                                value={formData.slug}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, slug: val }));
                                    setIsManualSlug(true);
                                }}
                                className="bg-transparent border-b border-white/10 focus:border-white focus:outline-none text-gray-300"
                            />
                        </div>

                        {/* Content Editor */}
                        <RichTextEditor
                            label="Content"
                            value={formData.content || ''}
                            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                            placeholder="Write your masterpiece..."
                            height="600px"
                        />

                        {/* Excerpt */}
                        <div className="space-y-2">
                            <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest">Excerpt (Short Summary)</label>
                            <textarea
                                value={formData.excerpt || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, excerpt: val }));
                                }}
                                placeholder="Briefly describe what this post is about..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 focus:border-white focus:outline-none text-white font-serif text-lg leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">Post Status</label>
                        <select
                            value={formData.status}
                            onChange={e => {
                                const val = e.target.value as any;
                                setFormData(prev => ({ ...prev, status: val }));
                            }}
                            className="w-full bg-black border border-white/20 px-3 py-3 text-white focus:border-white focus:outline-none mb-4 rounded-lg"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        <div className="flex items-center gap-3 px-1">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={formData.featured}
                                onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                className="w-4 h-4 rounded border-white/20 bg-black text-white"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-300">Feature this post</label>
                        </div>
                    </div>

                    {/* Cover Image Card */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">Cover Image</label>
                        <div
                            className="aspect-video bg-black/40 rounded-xl border border-dashed border-white/20 overflow-hidden relative group cursor-pointer"
                            onClick={() => document.getElementById('cover-upload')?.click()}
                        >
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 gap-2">
                                    <ImageIcon size={32} />
                                    <span className="text-xs font-mono uppercase">Upload Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                            </div>
                        </div>
                        <input
                            id="cover-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                    </div>

                    {/* SEO Settings Card */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-pink-500" />
                            <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest">SEO Optimization</label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.seo_title || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, seo_title: val }));
                                    }}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded"
                                    placeholder="Meta Title"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Meta Description</label>
                                <textarea
                                    value={formData.seo_description || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, seo_description: val }));
                                    }}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none h-20 rounded"
                                    placeholder="Meta Description"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-2">
                                    Keywords <span className="text-[9px] lowercase opacity-50">(Press Enter)</span>
                                </label>
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={addKeyword}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded mb-2"
                                    placeholder="Add keyword..."
                                />
                                <div className="flex flex-wrap gap-1">
                                    {formData.keywords?.map(word => (
                                        <span key={word} className="bg-white/10 text-[10px] px-2 py-1 flex items-center gap-1 rounded text-white group">
                                            {word}
                                            <button type="button" onClick={() => removeKeyword(word)} className="opacity-50 group-hover:opacity-100 hover:text-red-400">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

// Main Page Component
export const BlogEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: post, isLoading, error } = useBlogPostById(id && !isNew ? id : '');
    const createMutation = useCreateBlogPost();
    const updateMutation = useUpdateBlogPost();

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (payload: CreateBlogPostRequest) => {
        setIsSaving(true);
        try {
            if (isNew) {
                await createMutation.mutateAsync(payload);
            } else {
                await updateMutation.mutateAsync({ id: id!, payload });
            }
            navigate('/admin/blog');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save post');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !isNew) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-mono uppercase tracking-[0.2em] text-gray-400">Loading masterwork...</p>
            </div>
        </div>
    );

    if (error && !isNew) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Error loading post</h2>
            <p className="text-red-400 mb-6 max-w-md">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Link to="/admin/blog" className="px-6 py-2 bg-white text-black font-bold uppercase text-sm">Return to Blog</Link>
        </div>
    );

    return (
        <div className="p-8 pb-32 max-w-6xl mx-auto">
            <Link to="/admin/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-xs font-mono uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to Blog
            </Link>

            {/* We use the post.id as a key to ensure the form is completely re-created 
                when the data changes or we load a new post. This is the ultimate fix for stale state. */}
            <BlogEditorForm
                key={post?.id || 'new'}
                initialPost={post}
                isNew={isNew}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </div>
    );
};
