import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineEntries, useDeleteTimelineEntry, usePublishTimelineEntry, useUnpublishTimelineEntry } from '@/hooks/useTimeline';
import type { TimelineStatus } from '@/services/api/types';
import { Button, Select, Badge, PageHeader, Card, ActionButton, Input } from '../components/ui';
import { Edit, Plus, Eye, EyeOff, Search } from 'lucide-react';
import { useConfirm } from '../context/AdminConfirmContext';

const STATUS_OPTIONS: Array<TimelineStatus | 'all'> = ['all', 'published', 'draft'];

export const TimelinePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<TimelineStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { data: entries, isLoading, error } = useTimelineEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    order: 'display_order.asc',
  });
  const deleteMutation = useDeleteTimelineEntry();
  const publishMutation = usePublishTimelineEntry();
  const unpublishMutation = useUnpublishTimelineEntry();
  const confirm = useConfirm();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter(entry => {
      const searchLower = search.toLowerCase();
      return (
        entry.title.toLowerCase().includes(searchLower) ||
        (entry.body?.toLowerCase() || '').includes(searchLower) ||
        entry.date_label.toLowerCase().includes(searchLower)
      );
    });
  }, [entries, search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

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
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    let proceed = await confirm({
      title: 'Bulk Delete Entries',
      message: `Delete ${selectedIds.size} selected entries?`,
      confirmText: 'Next',
      variant: 'danger'
    });

    if (proceed) {
      proceed = await confirm({
        title: 'Confirm Bulk Action',
        message: `Are you sure you want to PERMANENTLY delete all ${selectedIds.size} selected entries?`,
        confirmText: 'Delete All',
        variant: 'danger'
      });
    }

    if (proceed) {
      const idsToDelete = Array.from(selectedIds);
      for (const id of idsToDelete) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    let proceed = await confirm({
      title: 'Delete Entry',
      message: title ? `Are you sure you want to delete "${title}"?` : 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (proceed) {
      proceed = await confirm({
        title: 'Final Warning',
        message: 'This action is PERMANENT and cannot be undone. Do you really want to proceed?',
        confirmText: 'Yes, Delete Permanently',
        variant: 'danger'
      });
    }

    if (proceed) {
      await deleteMutation.mutateAsync(id);
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
    <div className="p-12 cursor-auto">
      <PageHeader
        title="Timeline"
        subtitle="Journey & Milestones"
        action={
          <Button
            asLink
            to="/admin/timeline/new"
            icon={<Plus size={20} />}
          >
            New Entry
          </Button>
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
        <Input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={20} />}
          className="mb-6"
        />

        {/* Row 2: Selectors AND Bulk Actions */}
        <div className="relative flex items-center justify-between gap-4 min-h-[48px]">
          <div className="flex flex-wrap gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
            <Select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </Select>
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
                  <Button
                    variant="success"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={handleBulkPublish}
                  >
                    Publish
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={handleBulkUnpublish}
                  >
                    Unpublish
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading timeline...</div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Error loading timeline</p>
          <p className="text-gray-400 text-sm font-mono">{(error as any).message}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No timeline entries</p>
          <Link to="/admin/timeline/new" className="text-white underline">
            Create your first entry
          </Link>
        </div>
      ) : (
        <>
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/20 border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-24">Media</th>
                  <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold">Entry Details</th>
                  <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-48">Date Label</th>
                  <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-32">Status</th>
                  <th className="px-6 py-5 text-left font-mono text-xs uppercase tracking-wider font-bold w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedIds.has(entry.id) ? 'bg-white/10' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      {entry.media_url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/20 border border-white/10">
                          {entry.media_url.match(/\.(mp4|webm|mov)$/i) || entry.media_url.includes('/video/upload/') ? (
                            <video
                              src={entry.media_url}
                              className="w-full h-full object-contain"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img src={entry.media_url} alt={entry.title} className="w-full h-full object-contain" />
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10" />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold uppercase text-sm mb-1">{entry.title}</div>
                      {entry.body && (
                        <div className="text-xs text-gray-400 line-clamp-1 font-mono">
                          {entry.body}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs uppercase text-gray-400">{entry.date_label}</span>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={entry.status === 'published' ? 'published' : 'draft'}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          icon={Edit}
                          to={`/admin/timeline/${entry.id}`}
                          title="Edit"
                        />
                        {entry.status === 'published' ? (
                          <ActionButton
                            icon={EyeOff}
                            onClick={() => handleUnpublish(entry.id)}
                            title="Unpublish"
                          />
                        ) : (
                          <ActionButton
                            icon={Eye}
                            onClick={() => handlePublish(entry.id)}
                            title="Publish"
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, filtered.length)} of {filtered.length} entries
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>

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

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
