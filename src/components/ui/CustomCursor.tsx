
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // ULTRA-LOW LATENCY CONFIG:
  const springConfig = { damping: 28, stiffness: 2000, mass: 0.1 };
  
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isMagnetic, setIsMagnetic] = useState(false);
  const [cursorText, setCursorText] = useState<string>("");

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Offset will depend on cursor state, handled in rendering but motion values track mouse
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for cursor text first
      const textElement = target.closest('[data-cursor-text]');
      if (textElement) {
        setCursorText(textElement.getAttribute('data-cursor-text') || "");
      } else {
        setCursorText("");
      }

      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('[data-hover="true"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
      
      if (target.closest('[data-magnetic="true"]')) {
        setIsMagnetic(true);
      } else {
        setIsMagnetic(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Dimensions based on state - reduced size as requested
  const size = cursorText ? 100 : 20;
  const offset = size / 2;

  return (
    <motion.div
      className={`fixed top-0 left-0 rounded-full border pointer-events-none z-[100] flex items-center justify-center overflow-hidden transition-colors duration-200
        ${cursorText 
          ? 'bg-black border-white/10 mix-blend-normal' // Solid black background for text mode
          : 'bg-transparent border-white mix-blend-difference' // Hollow ring for default mode (inverts background)
        }`}
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        x: -offset,
        y: -offset,
      }}
      animate={{
        width: size,
        height: size,
        scale: isMagnetic ? 1.5 : isHovering ? (cursorText ? 1 : 3) : 1, // Larger scale on hover for ring
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <AnimatePresence mode="wait">
        {cursorText ? (
          <motion.span
            key="text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="text-white font-black text-xs uppercase tracking-widest text-center px-1 leading-tight"
          >
            {cursorText}
          </motion.span>
        ) : (
          <motion.div 
            key="dot"
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ scale: isHovering ? 0 : 1 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
