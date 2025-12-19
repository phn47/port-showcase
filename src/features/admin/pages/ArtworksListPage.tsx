import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtworks, useDeleteArtwork, usePublishArtwork, useUnpublishArtwork } from '@/hooks/useArtworks';
import { Plus, Search, Filter, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import type { ArtworkCategory } from '@/services/api/types';

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
    <div className="p-8 cursor-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Artworks</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
            Manage your portfolio
          </p>
        </div>
        <Link
          to="/admin/artworks/new"
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          New Artwork
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artworks..."
            className="w-full bg-white/5 border border-white/10 px-12 py-3 focus:border-white focus:outline-none transition-colors font-mono"
          />
        </div>

        {/* Status & Category Filters */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none font-mono uppercase text-sm text-white rounded"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none font-mono uppercase text-sm text-white rounded"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value) as 50 | 100);
              setPage(1);
            }}
            className="bg-black border border-white/20 px-4 py-2 focus:border-white focus:outline-none font-mono uppercase text-sm text-white rounded"
          >
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
          <span className="font-mono text-sm uppercase">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                selectedIds.forEach(id => handlePublish(id));
                setSelectedIds(new Set());
              }}
              className="px-4 py-2 bg-green-500 text-white font-mono text-xs uppercase hover:bg-green-600"
            >
              Publish Selected
            </button>
            <button
              onClick={() => {
                selectedIds.forEach(id => handleUnpublish(id));
                setSelectedIds(new Set());
              }}
              className="px-4 py-2 bg-yellow-500 text-white font-mono text-xs uppercase hover:bg-yellow-600"
            >
              Unpublish Selected
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} artworks?`)) {
                  selectedIds.forEach(id => handleDelete(id));
                  setSelectedIds(new Set());
                }
              }}
              className="px-4 py-2 bg-red-500 text-white font-mono text-xs uppercase hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>
        </div>
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
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredArtworks.length && filteredArtworks.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Thumbnail</th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider">Actions</th>
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
                    className={`border-b border-white/5 hover:bg-white/5 ${isSelected ? 'bg-white/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(artwork.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {primaryMedia ? (
                        <div className="w-16 h-16 bg-white/5 rounded overflow-hidden relative">
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
                    <td className="px-6 py-4">
                      <div className="font-bold uppercase">{artwork.title}</div>
                      {artwork.description && (
                        <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                          {artwork.description.substring(0, 60)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs uppercase text-gray-400">{artwork.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono uppercase ${artwork.status === 'published'
                          ? 'bg-green-500/20 text-green-500'
                          : artwork.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                          }`}
                      >
                        {artwork.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{artwork.display_order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/artworks/${artwork.id}`}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        {artwork.status === 'published' ? (
                          <button
                            onClick={() => handleUnpublish(artwork.id)}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                            title="Unpublish"
                          >
                            <EyeOff size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(artwork.id)}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                            title="Publish"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(artwork.id)}
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredArtworks.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400 font-mono uppercase">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, artworks?.length || 0)} of {artworks?.length || 0} artworks
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 border border-white/10 font-mono text-sm uppercase hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
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
                    className={`px-3 py-2 font-mono text-sm transition-colors ${page === pageNum
                      ? 'bg-white text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 border border-white/10 font-mono text-sm uppercase hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
