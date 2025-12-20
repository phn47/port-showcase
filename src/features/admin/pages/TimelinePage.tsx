import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTimelineEntries, useDeleteTimelineEntry } from '@/hooks/useTimeline';
import type { TimelineStatus } from '@/services/api/types';
import { AdminButton, AdminSelect, AdminBadge, AdminPageHeader, AdminCard, AdminActionButton } from '@/features/admin/components/ui';
import { Edit, Trash2, Plus } from 'lucide-react';

const STATUS_OPTIONS: Array<TimelineStatus | 'all'> = ['all', 'published', 'draft', 'archived'];

export const TimelinePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<TimelineStatus | 'all'>('all');
  const { data: entries, isLoading, error } = useTimelineEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    order: 'display_order.asc',
  });
  const deleteMutation = useDeleteTimelineEntry();

  const filtered = useMemo(() => entries || [], [entries]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this timeline entry?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (e: any) {
        alert(`Delete failed: ${e.message}`);
      }
    }
  };

  return (
    <div className="p-12 cursor-auto">
      <AdminPageHeader
        title="Timeline"
        subtitle="Manage roadmap milestones"
        action={
          <AdminButton
            asLink
            to="/admin/timeline/new"
            icon={<Plus size={20} />}
          >
            New Entry
          </AdminButton>
        }
      />

      {/* Filters */}
      <div className="mb-8">
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Status' : s}
            </option>
          ))}
        </AdminSelect>
      </div>

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
        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdminCard padding="md" hover className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold uppercase text-lg mb-2">{item.title}</div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-400 font-mono uppercase">{item.date_label}</span>
                    <span className="text-gray-500">•</span>
                    <AdminBadge variant={item.status === 'published' ? 'published' : item.status === 'archived' ? 'archived' : 'draft'}>
                      {item.status}
                    </AdminBadge>
                  </div>
                  {item.body && (
                    <div className="mt-2 text-gray-300 text-sm line-clamp-2">{item.body}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <AdminActionButton
                    icon={Edit}
                    to={`/admin/timeline/${item.id}`}
                    title="Edit"
                  />
                  <AdminActionButton
                    icon={Trash2}
                    onClick={() => handleDelete(item.id)}
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
