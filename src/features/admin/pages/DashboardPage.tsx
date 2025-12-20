import React from 'react';
import { Link } from 'react-router-dom';
import { useArtworks } from '@/hooks/useArtworks';
import { useBlogPosts } from '@/hooks/useBlog';
import { motion } from 'framer-motion';
import { Image, FileText, Eye, EyeOff, ArrowRight, Clock } from 'lucide-react';
import { AdminCard, AdminPageHeader, AdminBadge } from '@/features/admin/components/ui';

export const DashboardPage: React.FC = () => {
  const { data: allArtworks, isLoading } = useArtworks({ status: 'all' });
  const { data: publishedArtworks } = useArtworks({ status: 'published' });
  const { data: draftArtworks } = useArtworks({ status: 'draft' });
  const { data: blogData } = useBlogPosts({ status: 'all' });
  const blogPosts = blogData?.data || [];

  const stats = [
    {
      label: 'Total Artworks',
      value: allArtworks?.length || 0,
      icon: Image,
      color: 'text-white',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/20',
    },
    {
      label: 'Published',
      value: publishedArtworks?.length || 0,
      icon: Eye,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Drafts',
      value: draftArtworks?.length || 0,
      icon: EyeOff,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      label: 'Blog Posts',
      value: blogPosts.length || 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
  ];

  const recentArtworks = allArtworks?.slice(0, 6) || [];
  const recentPosts = blogPosts.slice(0, 3) || [];

  return (
    <div className="p-12 cursor-auto">
      {/* Header */}
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of your content"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`${stat.bgColor} border ${stat.borderColor} p-8 rounded-lg group hover:border-white/40 transition-all duration-500`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-lg bg-black/20 ${stat.color}`}>
                  <Icon size={28} />
                </div>
                <span className="text-6xl font-black leading-none">{stat.value}</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-mono font-bold">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Artworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AdminCard padding="lg" hover>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Recent Artworks</h2>
            <Link
              to="/admin/artworks"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="font-mono text-xs uppercase tracking-wider">View All</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {isLoading ? (
            <div className="text-gray-400 font-mono text-sm uppercase">Loading...</div>
          ) : recentArtworks.length > 0 ? (
            <div className="space-y-3">
              {recentArtworks.map((artwork, index) => {
                const primaryMedia = artwork.media?.find(m => m.is_primary) || artwork.media?.[0];
                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                    className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/20 hover:bg-black/30 transition-all group"
                  >
                    {primaryMedia && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {primaryMedia.type === 'video' || primaryMedia.url.match(/\.(mp4|webm|mov)$/i) ? (
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
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold uppercase text-sm mb-1 truncate">{artwork.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono uppercase">{artwork.category}</span>
                        <span className="text-gray-500">•</span>
                        <AdminBadge variant={artwork.status === 'published' ? 'published' : artwork.status === 'draft' ? 'draft' : 'default'}>
                          {artwork.status}
                        </AdminBadge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(artwork.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 font-mono text-sm uppercase text-center py-12">
              No artworks yet
            </div>
          )}
          </AdminCard>
        </motion.div>

        {/* Recent Blog Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <AdminCard padding="lg" hover>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Recent Posts</h2>
            <Link
              to="/admin/blog"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="font-mono text-xs uppercase tracking-wider">View All</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/20 hover:bg-black/30 transition-all group"
                >
                  {post.cover_image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold uppercase text-sm mb-1 truncate">{post.title}</div>
                      <div className="flex items-center gap-2">
                        <AdminBadge variant={post.status === 'published' ? 'published' : post.status === 'archived' ? 'archived' : 'draft'}>
                          {post.status}
                        </AdminBadge>
                      </div>
                    </div>
                  <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 font-mono text-sm uppercase text-center py-12">
              No posts yet
            </div>
          )}
          </AdminCard>
        </motion.div>
      </div>
    </div>
  );
};
