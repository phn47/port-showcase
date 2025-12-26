
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';

interface HeroProps {
  startAnimation: boolean;
}

const Hero: React.FC<HeroProps> = ({ startAnimation }) => {
  const { scrollY } = useScroll();
  const [activeIndex, setActiveIndex] = useState(0);

  // Parallax for Video (Slower)
  const videoY = useTransform(scrollY, [0, 1000], [0, 400]);
  const videoOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  // Parallax for Text (Faster - creates depth)
  const textY = useTransform(scrollY, [0, 1000], [0, 550]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Cycle active text every 2 seconds
  useEffect(() => {
    if (!startAnimation) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, [startAnimation]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.5
      }
    }
  };

  // Optimized for smoothness: Removed rotateX, added blur and fluid easing
  const itemVariants: Variants = {
    hidden: {
      y: 100,
      opacity: 0,
      filter: "blur(20px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1] // Custom bezier for silky smooth stop
      }
    }
  };

  // Define styles for active vs inactive state
  // Increased transition duration to 1000ms for breathing effect
  const getTextProps = (index: number) => {
    const isActive = activeIndex === index;
    return {
      className: `text-[8vw] md:text-[7vw] font-black select-none transition-all duration-1000 ease-in-out ${isActive
        ? "text-white opacity-100 scale-105 blur-0"
        : "text-transparent stroke-text opacity-30 scale-95 blur-[2px]"
        }`,
    };
  };

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-black text-white">

      {/* Background Video Layer */}
      <motion.div
        style={{ y: videoY, opacity: videoOpacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80"
        >
          <source src="https://www.dropbox.com/scl/fi/vcrkezj1o8uhxjf9ef5eu/Video-website.webm?rlkey=hpeylm20potbho8knn3kmyh56&e=2&st=ga2wivnf&raw=1" type="video/webm" />
        </video>
      </motion.div>

      {/* Typography Layer */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center h-full w-full pointer-events-none drop-shadow-2xl"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          className="flex flex-col items-center leading-[0.85] md:leading-[0.8] tracking-tighter gap-10 md:gap-20"
        >
          {/* Line 1: Dream */}
          <motion.h1 variants={itemVariants} {...getTextProps(0)}>
            WE DREAM
          </motion.h1>

          {/* Line 2: Do */}
          <motion.h1 variants={itemVariants} {...getTextProps(1)}>
            WE DO
          </motion.h1>

          {/* Line 3: Deliver (Underline removed) */}
          <motion.h1 variants={itemVariants} {...getTextProps(2)}>
            WE DELIVER
          </motion.h1>
        </motion.div>
      </motion.div>

    </section>
  );
};

export default Hero;
