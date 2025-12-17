
import React from 'react';
import { motion } from 'framer-motion';

const Marquee: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-16 bg-white text-black flex items-center overflow-hidden whitespace-nowrap border-t border-b border-black z-20 relative"
    >
      <motion.div 
        className="flex items-center text-4xl font-bold uppercase tracking-tighter"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        <span className="mx-8">Building The Future Of Creative & Chain</span>
        <span className="mx-8 font-mono opacity-50">//</span>
        <span className="mx-8">Building The Future Of Creative & Chain</span>
        <span className="mx-8 font-mono opacity-50">//</span>
        <span className="mx-8">Building The Future Of Creative & Chain</span>
        <span className="mx-8 font-mono opacity-50">//</span>
        <span className="mx-8">Building The Future Of Creative & Chain</span>
        <span className="mx-8 font-mono opacity-50">//</span>
      </motion.div>
    </motion.div>
  );
};

export default Marquee;
