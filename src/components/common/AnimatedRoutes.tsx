
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

            // Wait for mount - Immediate scroll
            const element = document.querySelector(target) as HTMLElement;
            if (element) {
                lenis.scrollTo(element, { offset: 0, immediate: true });
                // Chase logic
                setTimeout(() => lenis.scrollTo(element, { offset: 0, duration: 1.5, lock: false, force: true }), 600);
            }
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

        // If no specific scroll target is requested, scroll to top
        if (!location.state?.scrollTo) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [location.pathname, lenis, location.state]);

    return null;
};


const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // "Slow but smooth"
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

            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/admin/*" element={<AdminApp />} />

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
        </SmoothScroll>
    );
};
