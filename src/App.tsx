import React, { useState } from 'react';
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

const App: React.FC = () => {
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

      <Navigation />
      <Hero startAnimation={!isLoading} />
      <Marquee />
      <Gallery />
      <Timeline />
      <Services />
      <Contact />

      {/* Floating Controls (Chat + Scroll Top) */}
      {!isLoading && <FloatingControls />}
    </div>
  );
};

export default App;
