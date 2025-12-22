import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlog';
import { BlogFooter } from '@/components/layout/BlogFooter';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Tag } from 'lucide-react';

export const PublicBlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, isLoading } = useBlogPost(slug || '');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="bg-white min-h-screen text-black flex items-center justify-center font-mono">
                Loading...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-white min-h-screen text-black flex flex-col items-center justify-center font-mono">
                <h1 className="text-4xl font-bold mb-4">404 - Post not found</h1>
                <Link to="/blog" className="underline">Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen selection:bg-gray-200">
            <article className="pt-32 flex-grow">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Navigation Back */}
                    <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-8 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Blog
                    </Link>

                    {/* Article Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10 text-center md:text-left"
                    >
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm">
                            <span className="bg-black text-white px-3 py-1 rounded-full font-medium uppercase text-xs tracking-wider">
                                {post.tags?.[0] || 'Article'}
                            </span>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={14} />
                                <span>{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-900 mb-6">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-serif max-w-3xl">
                                {post.excerpt}
                            </p>
                        )}
                    </motion.div>

                    {/* Hero Image */}
                    {post.cover_image && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="rounded-2xl overflow-hidden shadow-xl mb-16 aspect-video bg-gray-100"
                        >
                            <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}

                    {/* Content Body */}
                    <div className="max-w-none">
                        {post.content?.trim().startsWith('<') ? (
                            <div
                                className="blog-content-rich-text"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        ) : (
                            <ReactMarkdown components={{
                                h1: ({ node, ...props }) => <h1 className="text-4xl md:text-5xl font-black mt-16 mb-8 text-gray-900" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-3xl md:text-4xl font-bold mt-16 mb-6 text-gray-900 leading-tight border-b border-gray-100 pb-4" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-10 mb-4 text-gray-900" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                                p: ({ node, ...props }) => <p className="text-xl leading-[1.8] mb-8 text-gray-800 font-serif" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-8 text-xl text-gray-800 font-serif space-y-3" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-8 text-xl text-gray-800 font-serif space-y-3" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-black pl-8 py-4 my-12 italic text-2xl leading-relaxed text-gray-600 bg-gray-50 rounded-r-xl" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                a: ({ node, ...props }) => <a className="text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer" {...props} />,
                                // Handle code blocks (block & inline)
                                code: ({ node, className, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match && !String(props.children).includes('\n');
                                    if (isInline) {
                                        return <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-0.9em font-mono font-bold" {...props} />
                                    }
                                    return (
                                        <div className="rounded-lg overflow-hidden my-10 shadow-lg border border-gray-800">
                                            <div className="bg-gray-900 px-4 py-2 text-xs font-mono text-gray-400 uppercase tracking-widest border-b border-gray-800">
                                                Code
                                            </div>
                                            <pre className="bg-gray-900 text-gray-100 p-6 overflow-x-auto m-0">
                                                <code className="font-mono text-sm leading-relaxed" {...props} />
                                            </pre>
                                        </div>
                                    )
                                },
                                pre: ({ node, ...props }: any) => {
                                    const { ref, ...rest } = props;
                                    return <div {...rest} />;
                                }, // Just a wrapper, logic handled in code
                                img: ({ node, ...props }) => (
                                    <figure className="my-12">
                                        <img className="w-full rounded-xl shadow-lg" {...props} />
                                        {props.alt && <figcaption className="text-center text-sm text-gray-500 mt-4 font-mono uppercase tracking-wide">{props.alt}</figcaption>}
                                    </figure>
                                ),
                                hr: ({ node, ...props }) => <hr className="my-16 border-gray-200" {...props} />,
                            }}>
                                {post.content || ''}
                            </ReactMarkdown>
                        )}
                    </div>

                    <style>{`
                        .blog-content-rich-text {
                            font-size: 1.25rem;
                            line-height: 1.8;
                            color: #1f2937;
                            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                        }
                        .blog-content-rich-text p {
                            margin-bottom: 2rem;
                        }
                        .blog-content-rich-text h1 { font-size: 3rem; font-weight: 900; margin-top: 4rem; margin-bottom: 2rem; color: #111827; }
                        .blog-content-rich-text h2 { font-size: 2.25rem; font-weight: 700; margin-top: 4rem; margin-bottom: 1.5rem; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem; }
                        .blog-content-rich-text h3 { font-size: 1.875rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; }
                        .blog-content-rich-text ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 2rem; }
                        .blog-content-rich-text ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 2rem; }
                        .blog-content-rich-text li { padding-left: 0.5rem; margin-bottom: 0.75rem; }
                        .blog-content-rich-text strong { font-weight: 700; color: #111827; }
                        .blog-content-rich-text a { color: #000; text-decoration: underline; text-underline-offset: 4px; }
                        .blog-content-rich-text blockquote { border-left: 4px solid #000; padding-left: 2rem; padding-top: 1rem; padding-bottom: 1rem; margin: 3rem 0; font-style: italic; font-size: 1.5rem; background: #f9fafb; border-top-right-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
                    `}</style>

                    {/* Footer Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Related Posts Section */}
                    <RelatedPosts currentPost={post} />
                </div>
            </article>

            <BlogFooter />
        </div>
    );
};

interface RelatedPostsProps {
    currentPost: any;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentPost }) => {
    const { data: allPostsData } = useBlogPosts({ status: 'published' });
    const allPosts = allPostsData?.data || [];

    // Filter to find related posts
    const relatedPosts = allPosts
        .filter(p => p.id !== currentPost.id) // Exclude current post
        .filter(p => {
            if (!p.tags || !currentPost.tags) return false;
            // Check if there's at least one common tag
            return p.tags.some((tag: string) => currentPost.tags.includes(tag));
        })
        .slice(0, 3); // Limit to 3 suggestions

    // Fallback to latest posts if no related posts found by tags
    const displayPosts = relatedPosts.length > 0
        ? relatedPosts
        : allPosts.filter(p => p.id !== currentPost.id).slice(0, 3);

    if (displayPosts.length === 0) return null;

    return (
        <div className="mt-24 pt-16 border-t border-gray-100">
            <h3 className="text-2xl font-bold mb-10 uppercase tracking-tight text-gray-900">
                You might also like
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayPosts.map((p) => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                            {p.cover_image && (
                                <img
                                    src={p.cover_image}
                                    alt={p.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-gray-400 mb-2">
                            <span>{format(new Date(p.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        <h4 className="text-lg font-bold leading-tight group-hover:text-black transition-colors">
                            {p.title}
                        </h4>
                    </Link>
                ))}
            </div>
        </div>
    );
};

