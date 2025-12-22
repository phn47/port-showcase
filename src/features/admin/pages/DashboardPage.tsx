import React from 'react';
import { Link } from 'react-router-dom';
import { useArtworks } from '@/hooks/useArtworks';
import { useBlogPosts } from '@/hooks/useBlog';
import { useServices } from '@/hooks/useServices';
import { useTimelineEntries } from '@/hooks/useTimeline';
import { useTags } from '@/hooks/useTags';
import { motion } from 'framer-motion';
import {
  Image, FileText, ArrowRight, Clock, Briefcase,
  Layers, Activity, Zap, BarChart3, Plus,
  Star, Tag, Sparkles
} from 'lucide-react';
import { Card, PageHeader, Badge, Button } from '../components/ui';

export const DashboardPage: React.FC = () => {
  // Fetch primary data
  const { data: allArtworks, isLoading: artworksLoading } = useArtworks({ status: 'all' });
  const { data: blogData, isLoading: blogLoading } = useBlogPosts({ status: 'all' });
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: timelineData, isLoading: timelineLoading } = useTimelineEntries();
  const { data: tagsData } = useTags();

  // Process data
  const artworks = allArtworks?.data || [];
  const blogPosts = blogData?.data || [];
  const services = servicesData || [];
  const timelineEntries = timelineData || [];
  const tags = tagsData || [];

  const totalArtworks = artworks.length;
  const publishedArtworks = artworks.filter(a => a.status === 'published').length;
  const totalPosts = blogPosts.length;
  const publishedPosts = blogPosts.filter(p => p.status === 'published').length;
  const totalServices = services.length;
  const totalMilestones = timelineEntries.length;

  // Calculate distributions
  const categoryCounts = artworks.reduce((acc: Record<string, number>, art) => {
    acc[art.category] = (acc[art.category] || 0) + 1;
    return acc;
  }, {});

  const topTags = tags.slice(0, 5);

  const stats = [
    {
      label: 'Artworks',
      value: totalArtworks,
      subValue: `${publishedArtworks} Live`,
      icon: Image,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Blog Posts',
      value: totalPosts,
      subValue: `${publishedPosts} Live`,
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Services',
      value: totalServices,
      subValue: 'Active Offerings',
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Milestones',
      value: totalMilestones,
      subValue: 'Journey Points',
      icon: Activity,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const quickActions = [
    { label: 'New Artwork', to: '/admin/artworks/new', icon: Plus, color: 'hover:text-blue-400' },
    { label: 'Write Post', to: '/admin/blog/new', icon: Plus, color: 'hover:text-purple-400' },
    { label: 'Add Service', to: '/admin/services/new', icon: Plus, color: 'hover:text-emerald-400' },
    { label: 'New Milestone', to: '/admin/timeline/new', icon: Plus, color: 'hover:text-amber-400' },
  ];

  const isLoading = artworksLoading || blogLoading || servicesLoading || timelineLoading;

  return (
    <div className="p-8 lg:p-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <PageHeader
          title="Studio Dashboard"
          subtitle="Manage artworks, stories, and services in one place"
        />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black font-mono">
                  <Zap size={10} fill="currentColor" />
                  LIVE
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black tracking-tighter text-white">
                  {isLoading ? '...' : stat.value}
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 font-bold">
                  {stat.label}
                </p>
                <p className="text-[10px] text-gray-500 font-mono italic">
                  {stat.subValue}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Distribution & Insights */}
        <div className="lg:col-span-2 space-y-8">
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-blue-400" />
                <h2 className="font-mono text-sm uppercase font-black tracking-widest text-white">Inventory Insights</h2>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Category Breakdown */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">Artworks by Category</h4>
                <div className="space-y-4">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-mono uppercase text-gray-400">
                        <span>{cat}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500/50"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalArtworks) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">Top Trending Tags</h4>
                  <Link to="/admin/artworks" className="text-[9px] font-mono text-blue-400 hover:text-white uppercase">View all</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((tag, idx) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono uppercase text-gray-400 flex items-center gap-2 hover:border-white/30 transition-colors"
                    >
                      <Tag size={10} style={{ color: tag.color }} />
                      {tag.name}
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                  <div className="flex gap-3">
                    <Star className="text-yellow-500 shrink-0" size={16} />
                    <p className="text-[10px] font-mono text-yellow-500/80 leading-relaxed uppercase">
                      Curator's Tip: Use more unique tags to improve artwork discoverability in the public gallery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Artworks */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h2 className="font-mono text-[11px] uppercase font-black tracking-widest text-gray-400">Creative Queue</h2>
                <Link to="/admin/artworks" className="p-1 hover:bg-white/10 rounded-md transition-colors"><ArrowRight size={14} /></Link>
              </div>
              <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto custom-scrollbar">
                {artworks.slice(0, 5).map((artwork) => {
                  const media = artwork.media?.[0];
                  return (
                    <div key={artwork.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors group">
                      <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0">
                        {media ? (
                          <img src={media.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><Image size={16} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{artwork.title}</div>
                        <div className="text-[10px] font-mono text-gray-500 uppercase">{artwork.category}</div>
                      </div>
                      <Badge variant={artwork.status === 'published' ? 'published' : 'draft'} className="text-[9px] py-0 px-2 h-5">
                        {artwork.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Blog Posts */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h2 className="font-mono text-[11px] uppercase font-black tracking-widest text-gray-400">Editorial Feed</h2>
                <Link to="/admin/blog" className="p-1 hover:bg-white/10 rounded-md transition-colors"><ArrowRight size={14} /></Link>
              </div>
              <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto custom-scrollbar">
                {blogPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{post.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1 uppercase">
                          <Clock size={10} />
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <Badge variant={post.status === 'published' ? 'published' : 'draft'} className="text-[9px] py-0 px-2 h-5">
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar: Quick Actions & System */}
        <div className="space-y-8">
          <Card title="Quick Launcher">
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.to}
                  className={`flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-all group ${action.color}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                      <action.icon size={16} />
                    </div>
                    <span className="text-xs font-mono uppercase font-bold tracking-widest">{action.label}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Core Features">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                  <Image size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-white font-bold">Gallery</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Curate artworks, media, and tags</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="p-2 bg-white/5 rounded-lg text-purple-400">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-white font-bold">Blog</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Publish stories, insights, and news</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="p-2 bg-white/5 rounded-lg text-emerald-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-white font-bold">Services</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Showcase offerings and highlights</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="p-2 bg-white/5 rounded-lg text-amber-400">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-white font-bold">Timeline</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Track milestones and project history</div>
                </div>
              </div>
            </div>
          </Card>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/20 rounded-2xl w-fit">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">View Portfolio Live</h3>
                <p className="text-xs text-white/70 font-mono uppercase mt-1">Open public site in new tab</p>
              </div>
              <Button
                onClick={() => window.open('/', '_blank')}
                className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-gray-100"
              >
                Go Live <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-black/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
