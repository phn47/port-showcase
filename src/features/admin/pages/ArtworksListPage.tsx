import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtworks, useDeleteArtwork, usePublishArtwork, useUnpublishArtwork } from '@/hooks/useArtworks';
import { Plus, Search, Filter, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import type { ArtworkCategory } from '@/services/api/types';
import { AdminButton, AdminInput, AdminSelect, AdminBadge, AdminPageHeader, AdminCard, AdminActionButton } from '@/features/admin/components/ui';

export const ArtworksListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ArtworkCategory | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState<50 | 100>(50);
  const [page, setPage] = useState(1);

  // Don't pass status filter if 'all' - fetch all statuses for admin
  const artworkFilters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(searchQuery && { q: searchQuery }),
    limit,
    offset: (page - 1) * limit,
  };

  const { data: artworks, isLoading, error: artworksError } = useArtworks(artworkFilters);

  console.log('ArtworksListPage - useArtworks result:', {
    artworks: artworks?.length,
    isLoading,
    error: artworksError?.message,
    filters: artworkFilters
  });

  const deleteMutation = useDeleteArtwork();
  const publishMutation = usePublishArtwork();
  const unpublishMutation = useUnpublishArtwork();

  // Filter by category (client-side)
  const filteredArtworks = useMemo(() => {
    if (!artworks) return [];
    if (categoryFilter === 'all') return artworks;
    return artworks.filter(a => a.category === categoryFilter);
  }, [artworks, categoryFilter]);

  // Calculate total pages
  const totalPages = Math.ceil((artworks?.length || 0) / limit);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this artwork?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete artwork');
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
    } catch (error) {
      alert('Failed to publish artwork');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishMutation.mutateAsync(id);
    } catch (error) {
      alert('Failed to unpublish artwork');
    }
  };

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
    if (selectedIds.size === filteredArtworks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArtworks.map(a => a.id)));
    }
  };

  const categories: ArtworkCategory[] = [
    'Illustration', 'Animation', 'Logo', 'Banner', 'NFT',
    'Meme', 'Sticker', 'Animated Sticker', 'GIF', 'Social Media', 'Comic'
  ];

  // Debug
  console.log('ArtworksListPage render', {
    artworks,
    isLoading,
    filteredArtworks,
    artworksLength: artworks?.length,
    filteredLength: filteredArtworks.length,
    statusFilter,
    categoryFilter
  });

  return (
    <div className="p-12 cursor-auto">
      {/* Header */}
      <AdminPageHeader
        title="Artworks"
        subtitle="Manage your portfolio"
        action={
          <AdminButton
            asLink
            to="/admin/artworks/new"
            icon={<Plus size={20} />}
          >
            New Artwork
          </AdminButton>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-8 space-y-4"
      >
        {/* Search */}
        <AdminInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search artworks..."
          icon={<Search size={20} />}
        />

        {/* Status & Category Filters */}
        <div className="flex flex-wrap gap-4">
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </AdminSelect>

          <AdminSelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </AdminSelect>

          <AdminSelect
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value) as 50 | 100);
              setPage(1);
            }}
          >
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </AdminSelect>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AdminCard padding="md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm uppercase tracking-wider font-bold">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-3">
                <AdminButton
                  variant="success"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach(id => handlePublish(id));
                    setSelectedIds(new Set());
                  }}
                >
                  Publish Selected
                </AdminButton>
                <AdminButton
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach(id => handleUnpublish(id));
                    setSelectedIds(new Set());
                  }}
                >
                  Unpublish Selected
                </AdminButton>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.size} artworks?`)) {
                      selectedIds.forEach(id => handleDelete(id));
                      setSelectedIds(new Set());
                    }
                  }}
                >
                  Delete Selected
                </AdminButton>
              </div>
            </div>
          </AdminCard>
        </motion.div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading artworks...</div>
      ) : artworksError ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Error loading artworks</p>
          <p className="text-gray-400 text-sm font-mono">{artworksError.message}</p>
        </div>
      ) : !artworks || artworks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No artworks found</p>
          <p className="text-sm mb-4">Query returned no data</p>
          <Link to="/admin/artworks/new" className="text-white underline">
            Create your first artwork
          </Link>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No artworks match filters</p>
          <p className="text-sm mb-4">
            Total artworks: {artworks.length} |
            Status: {statusFilter} |
            Category: {categoryFilter}
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-white text-black font-mono text-xs uppercase hover:bg-gray-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <AdminCard padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredArtworks.length && filteredArtworks.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Thumbnail</th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Title</th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Category</th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Status</th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Order</th>
                <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtworks.map((artwork, index) => {
                const primaryMedia = artwork.media?.find(m => m.is_primary) || artwork.media?.[0];
                const isSelected = selectedIds.has(artwork.id);

                return (
                  <motion.tr
                    key={artwork.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/10' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(artwork.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      {primaryMedia ? (
                        <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden relative border border-white/10">
                          {(primaryMedia.type === 'video' || primaryMedia.url.match(/\.(mp4|webm|mov)$/i)) ? (
                            <video
                              src={primaryMedia.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              onMouseOver={e => e.currentTarget.play()}
                              onMouseOut={e => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                            />
                          ) : (
                            <img
                              src={primaryMedia.url}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/5 rounded" />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold uppercase text-sm mb-1">{artwork.title}</div>
                      {artwork.description && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1 font-mono">
                          {artwork.description.substring(0, 60)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs uppercase text-gray-400">{artwork.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <AdminBadge variant={artwork.status === 'published' ? 'published' : artwork.status === 'draft' ? 'draft' : 'default'}>
                        {artwork.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm text-gray-400">{artwork.display_order}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <AdminActionButton
                          icon={Edit}
                          to={`/admin/artworks/${artwork.id}`}
                          title="Edit"
                        />
                        {artwork.status === 'published' ? (
                          <AdminActionButton
                            icon={EyeOff}
                            onClick={() => handleUnpublish(artwork.id)}
                            title="Unpublish"
                          />
                        ) : (
                          <AdminActionButton
                            icon={Eye}
                            onClick={() => handlePublish(artwork.id)}
                            title="Publish"
                          />
                        )}
                        <AdminActionButton
                          icon={Trash2}
                          onClick={() => handleDelete(artwork.id)}
                          variant="danger"
                          title="Delete"
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      )}

      {/* Pagination Controls */}
      {filteredArtworks.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, artworks?.length || 0)} of {artworks?.length || 0} artworks
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-3 font-mono text-sm transition-all rounded-lg ${page === pageNum
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    {pageNum}
                  </button>
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
    </div>
  );
};
