import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CustomCursor } from '@/components/ui/CustomCursor';
import Navigation from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/ui/Marquee';
import Gallery from '@/components/sections/Gallery';
import Timeline from '@/components/sections/Timeline';
import Services from '@/components/sections/Services';
import Contact from '@/components/sections/Contact';
import FloatingControls from '@/components/ui/FloatingControls';
import { Preloader } from '@/components/common/Preloader';
import { SmoothScroll } from '@/components/common/SmoothScroll';
import { MigrateDataPage } from '@/pages/MigrateData';
import { AdminApp } from '@/features/admin/AdminApp';
import { PublicBlogPage } from '@/pages/PublicBlogPage';
import { PublicBlogPostPage } from '@/pages/PublicBlogPostPage';

const PublicApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-white min-h-screen text-black cursor-none">
      <CustomCursor />

      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <SmoothScroll>
        <Navigation />
        <Hero startAnimation={!isLoading} />
        <Marquee />
        <Gallery />
        <Timeline />
        <Services />
        <Contact />

        {/* Floating Controls (Chat + Scroll Top) */}
        {!isLoading && <FloatingControls />}
      </SmoothScroll>
    </div>
  );
};

const App: React.FC = () => {
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    // Check if migration page should be shown (via URL hash or query param)
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (hash === '#migrate' || params.get('migrate') === 'true') {
      setShowMigration(true);
    }
  }, []);

  // Show migration page if requested
  if (showMigration) {
    return <MigrateDataPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/blog" element={
          <SmoothScroll>
            <PublicBlogPage />
          </SmoothScroll>
        } />
        <Route path="/blog/:slug" element={
          <SmoothScroll>
            <PublicBlogPostPage />
          </SmoothScroll>
        } />
        <Route path="/*" element={<PublicApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
