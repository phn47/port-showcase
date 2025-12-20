import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts, useDeleteBlogPost } from '@/hooks/useBlog';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Blog</h1>
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                        Manage your articles
                    </p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                    <Plus size={20} />
                    New Guy
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 focus:border-white focus:outline-none font-mono text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none font-mono uppercase text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-between group hover:border-white/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                {post.cover_image && (
                                    <img src={post.cover_image} alt="" className="w-16 h-16 object-cover rounded bg-black/50" />
                                )}
                                <div>
                                    <div className="font-bold text-lg mb-1">{post.title}</div>
                                    <div className="flex items-center gap-3 text-xs font-mono uppercase text-gray-400">
                                        <span className={`px-2 py-0.5 rounded border ${post.status === 'published' ? 'border-green-500 text-green-500' :
                                                post.status === 'archived' ? 'border-red-500 text-red-500' :
                                                    'border-yellow-500 text-yellow-500'
                                            }`}>
                                            {post.status}
                                        </span>
                                        <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                                        {post.slug && <span className="text-gray-600">/{post.slug}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {post.status === 'published' && (
                                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="View Live">
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                                <Link to={`/admin/blog/${post.id}`} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Edit">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id, post.title)}
                                    className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-500"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
