
import React, { useRef } from 'react';
import { motion, useScroll, useSpring, Variants } from 'framer-motion';

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Setup Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 85%"] // Start drawing when section hits center, finish just before the end
  });

  // 2. Add Physics Spring for "Fluid" Drawing (removes jitter)
  const pathLength = useSpring(scrollYProgress, { 
    stiffness: 400, 
    damping: 90,
    mass: 1 
  });

  // Define the path curve once to ensure both lines match perfectly
  // Ends at y=88 to stop exactly above "FUTURE"
  const pathData = "M 50 0 C 50 12, 20 12, 20 25 C 20 38, 80 38, 80 50 C 80 62, 20 62, 20 75 C 20 85, 50 85, 50 88";

  // Animation variants for reveal
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="timeline" ref={containerRef} className="relative w-full py-32 bg-white overflow-hidden text-black">
      
      {/* The Timeline SVG */}
      <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
         
         {/* LAYER 1: The Ghost Track (Continuous Grey Line) */}
         <path
            d={pathData}
            fill="none"
            stroke="#E5E5E5" // Very light gray
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
         />

         {/* LAYER 2: The Drawing Line (Animated Black Line) */}
         <motion.path
            d={pathData}
            fill="none"
            stroke="#000" // Stark Black
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength }} 
         />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="text-6xl md:text-9xl font-black uppercase text-center mb-32 opacity-100 text-black"
        >
            9F Roadmap
        </motion.h2>

        {/* Milestone 1: Undoxxed Artist (LEFT) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-start mb-48 relative pl-0 md:pl-12"
        >
          <div className="md:w-1/3 p-4">
             <div className="font-mono text-sm mb-2 text-black font-bold uppercase">Undoxxed Artist</div>
             <h3 className="text-6xl font-bold uppercase mb-4 tracking-tighter text-black">2021 – 2022</h3>
             <p className="font-mono text-sm max-w-xs text-gray-800">
               Started as an anonymous artist in Web3.
             </p>
          </div>
          <div className="md:w-1/2 md:ml-12 opacity-80 hover:opacity-100 transition-opacity">
            <img src="https://i.ibb.co/rfyyWNSJ/8.jpg" className="grayscale contrast-125 shadow-lg w-full max-w-md object-cover" alt="2021" />
          </div>
        </motion.div>

        {/* Milestone 2: 9F Studio Art (RIGHT) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-end mb-48 text-right relative pr-0 md:pr-2"
        >
           {/* Dot */}
           <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full hidden md:block z-20"></div>

           <div className="md:w-1/2 order-2 md:order-1 relative group">
              <motion.img 
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                src="https://i.ibb.co/Q79JYFN5/group-3-1.png" 
                className="w-full object-cover shadow-lg" 
                alt="Studio" 
              />
              <div className="absolute top-0 right-full mr-6 text-8xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 [writing-mode:vertical-rl] hidden md:block text-black leading-none">
                ART
              </div>
           </div>
           
           <div className="md:w-1/3 order-1 md:order-2 p-8 bg-black text-white -ml-12 z-10 shadow-xl">
              <h3 className="text-4xl md:text-5xl font-bold uppercase mb-4 tracking-tighter">2023 – 2024</h3>
              <h4 className="text-xl font-bold mb-2">9F Studio Art</h4>
              <p className="font-mono text-sm opacity-90">
                 Founded 9F Studio, built a 50+ artist team, and expanded into NFTs, memecoins, animation, and branding.
              </p>
           </div>
        </motion.div>

         {/* Milestone 3: 9F Holding (LEFT) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-start mb-48 relative pl-0 md:pl-12"
        >
          <div className="md:w-1/3 p-4">
             <div className="font-mono text-sm mb-2 text-black font-bold uppercase">9F Holding</div>
             <h3 className="text-6xl font-bold uppercase mb-4 tracking-tighter text-black">2025</h3>
             <p className="font-mono text-sm max-w-xs text-gray-800">
                Evolved into 9F Holding, developing Website Funnels, Development, UI/UX for Web3.
             </p>
          </div>
          <div className="md:w-1/2 md:ml-12 relative group cursor-none">
            <div className="relative overflow-hidden shadow-lg">
                <img 
                    src="https://i.ibb.co/twKx8KTc/68.jpg" 
                    className="grayscale contrast-125 w-full transition-opacity duration-700 group-hover:opacity-0" 
                    alt="2025 Base" 
                />
                <img 
                    src="https://i.ibb.co/VWz4LWy4/28.jpg" 
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                    alt="2025 Hover" 
                />
            </div>
          </div>
        </motion.div>

        {/* Milestone 4: Future (CENTER) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="flex flex-col items-center justify-center text-center mt-48 mb-32 relative"
        >
            <h4 className="text-2xl font-bold mb-2 uppercase text-black">Coming Soon...</h4>
            <h3 className="text-7xl md:text-9xl font-black uppercase text-transparent stroke-text mb-4">FUTURE</h3>
            <p className="font-mono text-sm max-w-md mx-auto text-gray-800">
                Launching 9F Dev and 9F Chain soon.
            </p>
        </motion.div>

      </div>
    </section>
  );
};

export default Timeline;
