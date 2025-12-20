import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlog';
import { BlogFooter } from '@/components/layout/BlogFooter';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useLenis } from '@/components/common/SmoothScroll';

export const PublicBlogPage: React.FC = () => {
    const { data, isLoading } = useBlogPosts({ status: 'published' });
    const posts = data?.data || [];
    const lenis = useLenis();

    // Ensure page scrolls to top when mounted
    useEffect(() => {
        if (lenis) {
            // Immediate scroll to top on mount
            lenis.scrollTo(0, { immediate: true });
            // Force scroll again after a short delay to ensure it sticks
            setTimeout(() => {
                lenis.scrollTo(0, { immediate: true });
            }, 50);
        }
    }, [lenis]);

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto px-4 pt-40 pb-20 flex-grow">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-32 pl-4 border-l-2 border-black"
                >
                    <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4">
                        Insights
                    </h1>
                    <p className="text-xl md:text-2xl font-serif text-gray-500 max-w-2xl mt-8 leading-relaxed">
                        Thoughts, tutorials, and deep dives into the world of design, code, and digital art.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="text-center py-20 font-mono text-xl tracking-widest text-gray-400">LOADING...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {posts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                                className="group flex flex-col h-full"
                            >
                                <Link to={`/blog/${post.slug}`} className="block overflow-hidden mb-8 rounded-lg">
                                    <div className="aspect-[3/2] overflow-hidden bg-gray-100 relative">
                                        {post.cover_image && (
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest">
                                            {post.tags?.[0] || 'Article'}
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">
                                        <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                                        <span>—</span>
                                        <span>{post.tags?.length || 0} min read</span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 group-hover:text-gray-600 transition-colors">
                                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>

                                    {post.excerpt && (
                                        <p className="text-gray-500 font-serif text-lg leading-relaxed line-clamp-3 mt-auto">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <BlogFooter />
        </div>
    );
};
