import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts, useDeleteBlogPost, usePublishBlogPost, useUnpublishBlogPost } from '@/hooks/useBlog';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Search, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminButton, AdminInput, AdminSelect, AdminBadge, AdminPageHeader, AdminCard, AdminActionButton } from '@/features/admin/components/ui';

export const BlogListPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);

    const { data, isLoading } = useBlogPosts({
        status: statusFilter,
        search: search || undefined,
    });

    const deleteMutation = useDeleteBlogPost();
    const publishMutation = usePublishBlogPost();
    const unpublishMutation = useUnpublishBlogPost();

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Delete post "${title}"? This cannot be undone.`)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const posts = data?.data || [];
    const totalPages = Math.ceil(posts.length / limit);
    const paginatedPosts = posts.slice((page - 1) * limit, page * limit);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedPosts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedPosts.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`Are you sure you want to PERMANENTLY delete ${selectedIds.size} selected posts? This action CANNOT be undone.`)) {
            const idsToDelete = Array.from(selectedIds);
            for (const id of idsToDelete) {
                await deleteMutation.mutateAsync(id);
            }
            setSelectedIds(new Set());
        }
    };

    const handleBulkPublish = async () => {
        const idsToPublish = Array.from(selectedIds);
        for (const id of idsToPublish) {
            await publishMutation.mutateAsync(id);
        }
        setSelectedIds(new Set());
    };

    const handleBulkUnpublish = async () => {
        const idsToUnpublish = Array.from(selectedIds);
        for (const id of idsToUnpublish) {
            await unpublishMutation.mutateAsync(id);
        }
        setSelectedIds(new Set());
    };

    const handlePublish = async (id: string) => {
        try {
            await publishMutation.mutateAsync(id);
        } catch (e: any) {
            alert(`Publish failed: ${e.message}`);
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await unpublishMutation.mutateAsync(id);
        } catch (e: any) {
            alert(`Unpublish failed: ${e.message}`);
        }
    };

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
            {/* Filters & Bulk Actions Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-8 space-y-4"
            >
                {/* Row 1: Search */}
                <AdminInput
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search size={20} />}
                />

                {/* Row 2: Selectors AND Bulk Actions */}
                <div className="relative flex items-center justify-between gap-4 min-h-[48px]">
                    <div className="flex flex-wrap gap-4">
                        <AdminSelect
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as any);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </AdminSelect>
                        <AdminSelect
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </AdminSelect>
                    </div>

                    <AnimatePresence>
                        {selectedIds.size > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute right-0 flex items-center gap-4 bg-black/60 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md shadow-2xl z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm uppercase tracking-wider font-bold text-white whitespace-nowrap">
                                        {selectedIds.size} selected
                                    </span>
                                    <button
                                        onClick={() => setSelectedIds(new Set())}
                                        className="text-[10px] font-mono uppercase text-gray-400 hover:text-white transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-white/10" />

                                <div className="flex gap-2">
                                    <AdminButton
                                        variant="success"
                                        size="sm"
                                        className="h-8 px-3 text-[10px]"
                                        onClick={handleBulkPublish}
                                    >
                                        Publish
                                    </AdminButton>
                                    <AdminButton
                                        variant="warning"
                                        size="sm"
                                        className="h-8 px-3 text-[10px]"
                                        onClick={handleBulkUnpublish}
                                    >
                                        Unpublish
                                    </AdminButton>
                                    <AdminButton
                                        variant="danger"
                                        size="sm"
                                        className="h-8 px-3 text-[10px]"
                                        onClick={handleBulkDelete}
                                    >
                                        Delete
                                    </AdminButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-400 mb-4">No posts found</p>
                    <Link to="/admin/blog/new" className="text-white underline font-mono uppercase text-sm">Create your first post</Link>
                </div>
            ) : (
                <>
                    <AdminCard padding="none" className="overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-black/20 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-5 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === paginatedPosts.length && paginatedPosts.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-24">Cover</th>
                                    <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Title & URL</th>
                                    <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-32">Status</th>
                                    <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-32">Date</th>
                                    <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPosts.map((post, index) => (
                                    <motion.tr
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedIds.has(post.id) ? 'bg-white/10' : ''}`}
                                    >
                                        <td className="px-6 py-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(post.id)}
                                                onChange={() => toggleSelect(post.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            {post.cover_image ? (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/20 border border-white/10">
                                                    {post.cover_image.match(/\.(mp4|webm|mov)$/i) || post.cover_image.includes('/video/upload/') ? (
                                                        <video
                                                            src={post.cover_image}
                                                            className="w-full h-full object-cover"
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-white/5 rounded border border-white/10" />
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold uppercase text-sm mb-1 line-clamp-1">{post.title}</div>
                                            <div className="text-xs font-mono text-gray-500 uppercase tracking-tighter">
                                                /{post.slug}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <AdminBadge variant={post.status === 'published' ? 'published' : post.status === 'archived' ? 'archived' : 'draft'}>
                                                {post.status}
                                            </AdminBadge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono text-gray-400 uppercase">
                                                {format(new Date(post.created_at), 'MMM dd, yyyy')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {post.status === 'published' && (
                                                    <AdminActionButton
                                                        icon={ExternalLink}
                                                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                                        title="View Live"
                                                    />
                                                )}
                                                <AdminActionButton
                                                    icon={Edit}
                                                    to={`/admin/blog/${post.id}`}
                                                    title="Edit"
                                                />
                                                {post.status === 'published' ? (
                                                    <AdminActionButton
                                                        icon={EyeOff}
                                                        onClick={() => handleUnpublish(post.id)}
                                                        title="Unpublish"
                                                    />
                                                ) : (
                                                    <AdminActionButton
                                                        icon={Eye}
                                                        onClick={() => handlePublish(post.id)}
                                                        title="Publish"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </AdminCard>

                    {/* Pagination Controls */}
                    {posts.length > 0 && (
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, posts.length)} of {posts.length} posts
                            </div>

                            <div className="flex items-center gap-3">
                                <AdminButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </AdminButton>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                                        .map((pageNum, i, arr) => {
                                            const showEllipsis = i > 0 && pageNum !== arr[i - 1] + 1;
                                            return (
                                                <React.Fragment key={pageNum}>
                                                    {showEllipsis && <span className="text-gray-600">...</span>}
                                                    <button
                                                        onClick={() => setPage(pageNum)}
                                                        className={`px-4 py-3 font-mono text-sm transition-all rounded-lg ${page === pageNum
                                                            ? 'bg-white text-black font-bold'
                                                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                <AdminButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </AdminButton>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
