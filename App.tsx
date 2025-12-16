
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomCursor } from './components/CustomCursor';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import Services from './components/Services';
import Contact from './components/Contact';
import { galleryData } from './data/index'; 

// --- SMART PRELOADER COMPONENT ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [visualCount, setVisualCount] = useState(0);
  
  // Use refs to track actual progress without triggering re-renders for the logic loop
  const targetCount = useRef(0);
  const loadedCount = useRef(0);
  const totalToLoad = useRef(0);

  useEffect(() => {
    // 1. SETUP: Determine what to load
    // OPTIMIZATION: Only preload the very first viewport (15 items) to get user in faster.
    // The rest will be handled by the Gallery's progressive loading.
    const PRIORITY_BATCH = galleryData.slice(0, 15);
    totalToLoad.current = PRIORITY_BATCH.length;

    if (totalToLoad.current === 0) {
        targetCount.current = 100;
    }

    // 2. LOAD: Trigger image fetching
    PRIORITY_BATCH.forEach((item) => {
        const img = new Image();
        img.src = item.src;
        
        const markLoaded = () => {
            loadedCount.current++;
            // Calculate real percentage
            const rawPercent = (loadedCount.current / totalToLoad.current) * 100;
            targetCount.current = Math.floor(rawPercent);
        };

        // Mark complete on success OR error (so one bad link doesn't hang the site)
        img.onload = markLoaded;
        img.onerror = markLoaded;
    });

    // 3. ANIMATE: The "Chaser" Loop
    // This makes the visual number catch up to the real number smoothly but quickly
    const updateInterval = setInterval(() => {
        setVisualCount((prev) => {
            const dest = targetCount.current;
            
            // If we reached the target, stay there
            if (prev >= dest) {
                return dest;
            }

            // Calculate "speed" based on distance. 
            // Further away = faster jump. Closer = smaller step.
            // This creates a natural easing effect.
            const diff = dest - prev;
            const step = Math.ceil(diff / 4); // Jump 1/4th of the remaining distance
            
            return prev + step;
        });
    }, 30); // Run ~33fps for smooth numbers

    // 4. SAFETY: Fallback timeout (Max 3 seconds - faster fallback)
    // If images take too long, we force entry.
    const fallbackTimeout = setTimeout(() => {
        targetCount.current = 100;
    }, 3000);

    return () => {
        clearInterval(updateInterval);
        clearTimeout(fallbackTimeout);
    };
  }, []);

  // 5. FINISH: Watch for 100% and trigger exit
  useEffect(() => {
    if (visualCount >= 100) {
        // Very short delay just to let the user see "100%" for a split second
        const finishTimer = setTimeout(() => {
            onComplete();
        }, 200); 
        return () => clearTimeout(finishTimer);
    }
  }, [visualCount, onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ 
        y: "-100%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[999] bg-black text-white flex items-center justify-center cursor-wait"
    >
      {/* Percentage Display */}
      <h1 className="text-[15vw] md:text-[12vw] font-black leading-none tracking-tighter tabular-nums">
        {visualCount}%
      </h1>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    window.scrollTo(0,0);
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
    </div>
  );
};

export default App;
