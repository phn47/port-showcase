import React from 'react';
import { Link } from 'react-router-dom';
import { useArtworks } from '@/hooks/useArtworks';
import { useBlogPosts } from '@/hooks/useBlog';
import { motion } from 'framer-motion';
import { Image, FileText, Eye, EyeOff, ArrowRight, Clock } from 'lucide-react';
import { Card, PageHeader, Badge } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { data: allArtworks, isLoading } = useArtworks({ status: 'all' });
  const { data: publishedArtworks } = useArtworks({ status: 'published' });
  const { data: draftArtworks } = useArtworks({ status: 'draft' });
  const { data: blogData } = useBlogPosts({ status: 'all' });
  const blogPosts = blogData?.data || [];
  const totalArtworks = allArtworks?.data?.length || 0;
  const publishedArtworksCount = publishedArtworks?.data?.length || 0;
  const totalPosts = blogPosts.length;
  const publishedPosts = blogPosts.filter(p => p.status === 'published').length;

  const stats = [
    {
      label: 'Total Artworks',
      value: totalArtworks,
      icon: Image,
      color: 'text-white',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/20',
    },
    {
      label: 'Published',
      value: publishedArtworksCount,
      icon: Eye,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Drafts',
      value: draftArtworks?.data?.length || 0,
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

  const recentArtworks = allArtworks?.data?.slice(0, 6) || [];
  const recentPosts = blogPosts.slice(0, 3) || [];

  return (
    <div className="p-12 cursor-auto">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Snapshot of your portfolio"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card hover className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-lg text-white">
              <Image size={24} />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black mb-1">{totalArtworks}</div>
              <div className="text-[10px] font-mono uppercase text-gray-400 tracking-widest">Total Artworks</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 uppercase">Published</span>
              <span className="text-green-400">{publishedArtworksCount}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500/50"
                style={{ width: `${(publishedArtworksCount / totalArtworks) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card hover className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black mb-1">{totalPosts}</div>
              <div className="text-[10px] font-mono uppercase text-gray-400 tracking-widest">Total Posts</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 uppercase">Published</span>
              <span className="text-blue-400">{publishedPosts}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500/50"
                style={{ width: `${(publishedPosts / totalPosts) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Artworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card padding="none" className="flex-1 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="font-mono text-sm uppercase font-black tracking-widest text-white">Recent Artworks</h2>
              <Link to="/admin/artworks" className="text-[10px] font-mono uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {isLoading ? (
                <div className="text-gray-400 font-mono text-sm uppercase p-6">Loading...</div>
              ) : recentArtworks.length > 0 ? (
                recentArtworks.map((artwork, index) => {
                  const primaryMedia = artwork.media?.find(m => m.is_primary) || artwork.media?.[0];
                  return (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                      className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0">
                        {primaryMedia && (
                          primaryMedia.type === 'video' || primaryMedia.url.match(/\.(mp4|webm|mov)$/i) ? (
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
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            />
                          ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold uppercase truncate text-white">{artwork.title}</div>
                        <div className="text-[10px] font-mono text-gray-500 uppercase">{artwork.category}</div>
                      </div>
                      <Badge variant={artwork.status === 'published' ? 'published' : 'draft'}>
                        {artwork.status}
                      </Badge>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-gray-400 font-mono text-sm uppercase text-center py-12">
                  No artworks yet
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Blog Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card padding="none" className="flex-1 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="font-mono text-sm uppercase font-black tracking-widest text-white">Recent Posts</h2>
              <Link to="/admin/blog" className="text-[10px] font-mono uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentPosts.length > 0 ? (
                recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                  >
                    {post.cover_image && (
                      <div className="w-12 h-12 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0">
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold uppercase truncate text-white">{post.title}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={post.status === 'published' ? 'published' : post.status === 'archived' ? 'archived' : 'draft'}>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-400 font-mono text-sm uppercase text-center py-12">
                  No posts yet
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
