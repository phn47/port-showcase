import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtworks, useDeleteArtwork, usePublishArtwork, useUnpublishArtwork } from '@/hooks/useArtworks';
import { Plus, Search, Filter, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import type { ArtworkCategory } from '@/services/api/types';
import { AdminButton, AdminInput, AdminSelect, AdminBadge, AdminPageHeader, AdminCard, AdminActionButton } from '@/features/admin/components/ui';
import { useConfirm } from '../context/AdminConfirmContext';

export const ArtworksListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
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

  const { data, isLoading, error: artworksError } = useArtworks(artworkFilters);
  const artworks = data?.data;
  const totalArtworks = data?.count || 0;

  console.log('ArtworksListPage - useArtworks result:', {
    artworksCount: artworks?.length,
    totalCount: totalArtworks,
    isLoading,
    error: artworksError?.message,
    filters: artworkFilters
  });

  const deleteMutation = useDeleteArtwork();
  const publishMutation = usePublishArtwork();
  const unpublishMutation = useUnpublishArtwork();
  const confirm = useConfirm();

  // Filter by category (client-side)
  const filteredArtworks = useMemo(() => {
    if (!artworks) return [];
    if (categoryFilter === 'all') return artworks;
    return artworks.filter(a => a.category === categoryFilter);
  }, [artworks, categoryFilter]);

  // Calculate total pages
  const totalPages = Math.ceil(totalArtworks / limit);

  const handleDelete = async (id: string, skipConfirm = false) => {
    let proceed = skipConfirm;

    if (!proceed) {
      // Step 1: Initial confirmation
      proceed = await confirm({
        title: 'Delete Artwork',
        message: 'Are you sure you want to delete this artwork?',
        confirmText: 'Delete',
        variant: 'danger'
      });

      // Step 2: Final confirmation
      if (proceed) {
        proceed = await confirm({
          title: 'Final Warning',
          message: 'This action is PERMANENT and cannot be undone. Do you really want to proceed?',
          confirmText: 'Yes, Delete Permanently',
          variant: 'danger'
        });
      }
    }

    if (proceed) {
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search artworks..."
          icon={<Search size={20} />}
        />

        {/* Row 2: Selectors AND Bulk Actions */}
        <div className="relative flex items-center justify-between gap-4 min-h-[48px]">
          <div className="flex flex-wrap gap-4">
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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
                    onClick={() => {
                      selectedIds.forEach(id => handlePublish(id));
                      setSelectedIds(new Set());
                    }}
                  >
                    Publish
                  </AdminButton>
                  <AdminButton
                    variant="warning"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={() => {
                      selectedIds.forEach(id => handleUnpublish(id));
                      setSelectedIds(new Set());
                    }}
                  >
                    Unpublish
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={async () => {
                      // Step 1: Bulk confirm
                      let proceed = await confirm({
                        title: 'Bulk Delete',
                        message: `Delete ${selectedIds.size} artworks?`,
                        confirmText: 'Next',
                        variant: 'danger'
                      });

                      // Step 2: Final bulk confirm
                      if (proceed) {
                        proceed = await confirm({
                          title: 'Confirm Bulk Action',
                          message: `Are you sure you want to PERMANENTLY delete all ${selectedIds.size} selected items?`,
                          confirmText: 'Delete All',
                          variant: 'danger'
                        });
                      }

                      if (proceed) {
                        for (const id of Array.from(selectedIds)) {
                          await handleDelete(id, true);
                        }
                        setSelectedIds(new Set());
                      }
                    }}
                  >
                    Delete
                  </AdminButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
            Total match current filters: {artworks?.length || 0} |
            Total in database: {totalArtworks} |
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
                        <div className="w-24 h-24 bg-white/5 rounded-lg overflow-hidden relative border border-white/10">
                          {(primaryMedia.type === 'video' || primaryMedia.url.match(/\.(mp4|webm|mov)$/i) || primaryMedia.url.includes('/video/upload/')) ? (
                            <video
                              src={primaryMedia.url}
                              className="w-full h-full object-contain"
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
                              className="w-full h-full object-contain"
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
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalArtworks)} of {totalArtworks} artworks
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
