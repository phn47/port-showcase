
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminApp } from '@/features/admin/AdminApp';
import { PublicBlogPage } from '@/pages/PublicBlogPage';
import { PublicBlogPostPage } from '@/pages/PublicBlogPostPage';
import { SmoothScroll, useLenis } from '@/components/common/SmoothScroll';
import Navigation from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/ui/Marquee';
import Gallery from '@/components/sections/Gallery';
import Timeline from '@/components/sections/Timeline';
import Services from '@/components/sections/Services';
import Contact from '@/components/sections/Contact';
import FloatingControls from '@/components/ui/FloatingControls';
import { Preloader } from '@/components/common/Preloader';
import { CustomCursor } from '@/components/ui/CustomCursor';

// PublicHome receives scroll targets
const PublicHome: React.FC = () => {
    const location = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        if (location.state && location.state.scrollTo && lenis) {
            const target = location.state.scrollTo;
            window.history.replaceState({}, document.title);

            // Wait for Gallery to load and render before fine-tuning scroll position
            // ScrollManager already did immediate scroll, we just need to fine-tune
            const waitForGalleryAndScroll = () => {
                const element = document.querySelector(target) as HTMLElement;
                if (!element) return;

                // If scrolling to sections after gallery (timeline, services, contact)
                const sectionsAfterGallery = ['#timeline', '#services', '#contact'];
                const isAfterGallery = sectionsAfterGallery.includes(target);
                
                if (isAfterGallery) {
                    // Wait for gallery to be rendered and have content
                    let attempts = 0;
                    const maxAttempts = 20;
                    
                    const checkGalleryReady = () => {
                        const gallerySection = document.querySelector('#gallery') as HTMLElement;
                        const galleryGrid = gallerySection?.querySelector('.grid');
                        const hasContent = galleryGrid && galleryGrid.children.length > 0;
                        
                        // Check if gallery has rendered content or has minimum height
                        if (hasContent || (gallerySection && gallerySection.offsetHeight > 300)) {
                            // Gallery seems ready, fine-tune scroll position
                            setTimeout(() => {
                                lenis.scrollTo(element, { offset: 0, duration: 1.2, lock: false, force: true });
                                // Final adjustment to ensure perfect position
                                setTimeout(() => {
                                    lenis.scrollTo(element, { offset: 0, duration: 1.0, lock: false, force: true });
                                }, 600);
                            }, 200);
                        } else {
                            // Gallery not ready yet, check again (max 20 times = 2 seconds)
                            attempts++;
                            if (attempts < maxAttempts) {
                                setTimeout(checkGalleryReady, 100);
                            } else {
                                // Fallback: fine-tune scroll anyway after max attempts
                                lenis.scrollTo(element, { offset: 0, duration: 1.2, lock: false, force: true });
                            }
                        }
                    };
                    
                    // Start checking after a short delay to allow DOM to update
                    setTimeout(checkGalleryReady, 150);
                } else {
                    // For sections before or at gallery, just fine-tune position
                    setTimeout(() => {
                        lenis.scrollTo(element, { offset: 0, duration: 1.2, lock: false, force: true });
                    }, 300);
                }
            };

            // Start fine-tuning scroll after a short delay
            setTimeout(waitForGalleryAndScroll, 100);
        }
    }, [location, lenis]);

    return (
        <>
            <Hero startAnimation={true} />
            <Marquee />
            <Gallery />
            <Timeline />
            <Services />
            <Contact />
        </>
    );
};

// Component to handle Scroll To Top on route change
const ScrollManager: React.FC = () => {
    const location = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis) return;

        // If specific scroll target is requested, scroll immediately
        if (location.state?.scrollTo) {
            const target = location.state.scrollTo;
            
            // Try to scroll immediately, with retry if element not ready yet
            const tryScroll = (attempts = 0) => {
                const targetElement = document.querySelector(target) as HTMLElement;
                if (targetElement) {
                    lenis.scrollTo(targetElement, { offset: 0, immediate: true });
                } else if (attempts < 10) {
                    // Retry if element not found yet (max 10 attempts = 100ms)
                    requestAnimationFrame(() => tryScroll(attempts + 1));
                }
            };
            
            // Start trying immediately
            requestAnimationFrame(() => tryScroll(0));
        } else {
            // If no specific scroll target is requested, scroll to top
            setTimeout(() => {
                lenis.scrollTo(0, { immediate: true });
                // Force scroll again after a short delay to ensure it sticks
                setTimeout(() => {
                    lenis.scrollTo(0, { immediate: true });
                }, 100);
            }, 0);
        }
    }, [location.pathname, lenis, location.state]);

    return null;
};


const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const hasScrollTarget = !!location.state?.scrollTo;
    
    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ 
                duration: hasScrollTarget ? 0.2 : 0.5, // Faster transition when scrolling to target
                ease: [0.22, 1, 0.36, 1] 
            }}
            className="w-full min-h-screen bg-white"
        >
            {children}
        </motion.div>
    );
};

export const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <SmoothScroll>
            <ScrollManager />
            {/* Global Fixed Elements (Only for public pages) */}
            {!isAdmin && (
                <>
                    <Navigation />
                    <FloatingControls />
                </>
            )}

            {isAdmin ? (
                // Admin routes - no transition, instant switching
                <Routes location={location}>
                    <Route path="/admin/*" element={<AdminApp />} />
                </Routes>
            ) : (
                // Public routes - with smooth transitions
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/blog" element={
                            <PageTransition>
                                <PublicBlogPage />
                            </PageTransition>
                        } />

                        <Route path="/blog/:slug" element={
                            <PageTransition>
                                <PublicBlogPostPage />
                            </PageTransition>
                        } />

                        <Route path="/*" element={
                            <PageTransition>
                                <PublicHome />
                            </PageTransition>
                        } />
                    </Routes>
                </AnimatePresence>
            )}
        </SmoothScroll>
    );
};
