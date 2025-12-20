import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts, useDeleteBlogPost } from '@/hooks/useBlog';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminButton, AdminInput, AdminSelect, AdminBadge, AdminPageHeader, AdminCard, AdminActionButton } from '@/features/admin/components/ui';

export const BlogListPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
    const [search, setSearch] = useState('');

    const { data, isLoading } = useBlogPosts({
        status: statusFilter,
        search: search || undefined,
    });

    const deleteMutation = useDeleteBlogPost();

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Delete post "${title}"? This cannot be undone.`)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const posts = data?.data || [];

    return (
        <div className="p-12">
            <AdminPageHeader
                title="Blog"
                subtitle="Manage your articles"
                action={
                    <AdminButton
                        asLink
                        to="/admin/blog/new"
                        icon={<Plus size={20} />}
                    >
                        New Post
                    </AdminButton>
                }
            />

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex gap-4 mb-8"
            >
                <div className="flex-1 max-w-md">
                    <AdminInput
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search size={18} />}
                    />
                </div>
                <AdminSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </AdminSelect>
            </motion.div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-400 mb-4">No posts found</p>
                    <Link to="/admin/blog/new" className="text-white underline font-mono uppercase text-sm">Create your first post</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <AdminCard padding="md" hover className="flex items-center justify-between group">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                {post.cover_image && (
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                    <div className="flex-1 min-w-0">
                                    <div className="font-bold text-lg mb-2 uppercase">{post.title}</div>
                                    <div className="flex items-center gap-3 text-xs font-mono uppercase">
                                        <AdminBadge variant={post.status === 'published' ? 'published' : post.status === 'archived' ? 'archived' : 'draft'}>
                                            {post.status}
                                        </AdminBadge>
                                        <span className="text-gray-400">{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                                        {post.slug && <span className="text-gray-500">/{post.slug}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                {post.status === 'published' && (
                                    <a 
                                        href={`/blog/${post.slug}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="p-2.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all hover:scale-110 inline-flex items-center justify-center" 
                                        title="View Live"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                                <AdminActionButton
                                    icon={Edit}
                                    to={`/admin/blog/${post.id}`}
                                    title="Edit"
                                />
                                <AdminActionButton
                                    icon={Trash2}
                                    onClick={() => handleDelete(post.id, post.title)}
                                    variant="danger"
                                    title="Delete"
                                />
                            </div>
                            </AdminCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
