import React from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import { motion } from 'framer-motion';
import { Image, FileText, Eye, EyeOff } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: allArtworks, isLoading, error } = useArtworks({ status: 'all' });
  const { data: publishedArtworks } = useArtworks({ status: 'published' });
  const { data: draftArtworks } = useArtworks({ status: 'draft' });

  // Debug
  console.log('Dashboard data:', { allArtworks, isLoading, error });

  const stats = [
    {
      label: 'Total Artworks',
      value: allArtworks?.length || 0,
      icon: Image,
      color: 'text-white',
    },
    {
      label: 'Published',
      value: publishedArtworks?.length || 0,
      icon: Eye,
      color: 'text-green-500',
    },
    {
      label: 'Drafts',
      value: draftArtworks?.length || 0,
      icon: EyeOff,
      color: 'text-yellow-500',
    },
  ];

  const recentArtworks = allArtworks?.slice(0, 5) || [];

  return (
    <div className="p-8 cursor-auto">
      <div className="mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
          Overview of your content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} className={stat.color} />
                <span className="text-4xl font-black">{stat.value}</span>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Artworks */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6">Recent Artworks</h2>
        {isLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : recentArtworks.length > 0 ? (
          <div className="space-y-4">
            {recentArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="font-bold uppercase">{artwork.title}</div>
                  <div className="text-sm text-gray-400 font-mono uppercase">
                    {artwork.category} • {artwork.status}
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {new Date(artwork.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No artworks yet</div>
        )}
      </div>
    </div>
  );
};
