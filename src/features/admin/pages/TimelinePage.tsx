import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTimelineEntries, useDeleteTimelineEntry } from '@/hooks/useTimeline';
import type { TimelineStatus } from '@/services/api/types';

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
    <div className="p-8 cursor-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Timeline</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
            Manage roadmap milestones
          </p>
        </div>
        <Link
          to="/admin/timeline/new"
          className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
        >
          New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 px-4 py-2 focus:border-white focus:outline-none font-mono uppercase text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start justify-between"
            >
              <div>
                <div className="font-bold uppercase text-lg">{item.title}</div>
                <div className="text-sm text-gray-400 font-mono uppercase">
                  {item.date_label} • {item.status}
                </div>
                {item.body && (
                  <div className="mt-2 text-gray-300 text-sm line-clamp-2">{item.body}</div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  to={`/admin/timeline/${item.id}`}
                  className="px-3 py-2 bg-white text-black font-mono uppercase hover:bg-gray-200"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 bg-red-500 text-white font-mono uppercase hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
