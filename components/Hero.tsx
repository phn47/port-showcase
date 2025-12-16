
import React from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';

interface HeroProps {
  startAnimation: boolean;
}

const Hero: React.FC<HeroProps> = ({ startAnimation }) => {
  const { scrollY } = useScroll();
  
  // Parallax for Video (Slower)
  const videoY = useTransform(scrollY, [0, 1000], [0, 400]); 
  const videoOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  // Parallax for Text (Faster - creates depth)
  const textY = useTransform(scrollY, [0, 1000], [0, 550]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.8 // Start shortly AFTER preloader is gone
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      y: 120, 
      opacity: 0, 
      rotateX: -20,
      filter: "blur(12px)" 
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0,
      filter: "blur(0px)", // Focus in
      transition: { 
        duration: 1.4, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-black text-white">
      
      {/* Background Video Layer */}
      <motion.div 
        style={{ y: videoY, opacity: videoOpacity }} 
        className="absolute inset-0 w-full h-full"
      >
        {/* Increased overlay opacity for better text readability */}
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
        // Removed mix-blend-overlay, added drop-shadow for separation
        className="absolute inset-0 z-20 flex flex-col items-center justify-center h-full w-full pointer-events-none drop-shadow-2xl"
      >
         <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={startAnimation ? "visible" : "hidden"}
            className="flex flex-col items-center leading-[0.85] md:leading-[0.8] tracking-tighter"
         >
            {/* Line 1: Dream (Outline/Ethereal) */}
            <motion.h1 variants={itemVariants} className="text-[8vw] md:text-[6vw] font-black text-white/5 stroke-text select-none">
              WE DREAM
            </motion.h1>

            {/* Line 2: Do (Solid/Action) */}
            <motion.h1 variants={itemVariants} className="text-[8vw] md:text-[6vw] font-black text-white select-none">
              WE DO
            </motion.h1>

            {/* Line 3: Deliver (Solid/Result/Impact) */}
            <motion.h1 variants={itemVariants} className="text-[8vw] md:text-[6vw] font-black text-white select-none relative">
              WE DELIVER
              <motion.div 
                initial={{ width: 0 }}
                animate={startAnimation ? { width: "100%" } : { width: 0 }}
                transition={{ delay: 2.2, duration: 1, ease: "circOut" }}
                className="absolute -bottom-2 left-0 h-1 md:h-2 bg-white"
              />
            </motion.h1>
         </motion.div>
      </motion.div>

    </section>
  );
};

export default Hero;
