import React, { useEffect, createContext, useContext, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger to work with Lenis
gsap.registerPlugin(ScrollTrigger);

const SmoothScrollContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(SmoothScrollContext);

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            touchMultiplier: 2,
        });

        // Force scroll to top on mount (fixes issue when navigating between pages)
        lenisInstance.scrollTo(0, { immediate: true });

        setLenis(lenisInstance);

        // Synchronize Lenis scroll with GSAP ScrollTrigger
        lenisInstance.on('scroll', ScrollTrigger.update);

        // Add Lenis's requestAnimationFrame to GSAP's ticker for smoother sync
        gsap.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
        });

        // Disable GSAP's lag smoothing to prevent stuttering
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenisInstance.destroy();
            gsap.ticker.remove((time) => lenisInstance.raf(time * 1000));
        };
    }, []);

    return (
        <SmoothScrollContext.Provider value={lenis}>
            {children}
        </SmoothScrollContext.Provider>
    );
};
