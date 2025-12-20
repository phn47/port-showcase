
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const Contact: React.FC = () => {

  const handleContact = () => {
    // Logic: Open default email client
    window.location.href = "mailto:hello@9f.com?subject=Project%20Inquiry%20from%209F%20Website";
  };

  const buttonVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: -5,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    },
    tap: { scale: 0.95 }
  };

  const textContainerVariants = {
    initial: { y: 0 },
    hover: { y: "-50%", transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] } }
  };

  const revealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <section id="contact" className="w-full min-h-screen bg-white flex flex-col justify-between pt-32 pb-8 px-8 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <motion.div
        className="flex-grow flex flex-col items-center justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
      >
        <p className="font-mono text-sm mb-12 text-gray-400 uppercase tracking-widest">Ready to initiate?</p>

        {/* Optimized Interaction Button */}
        <motion.button
          onClick={handleContact}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-black text-white flex items-center justify-center cursor-pointer group"
          data-hover="true"
        >
          {/* Inner Content Mask */}
          <div className="relative h-20 md:h-24 overflow-hidden flex flex-col items-center justify-start pointer-events-none">

            {/* Rolling Text Container */}
            <motion.div
              variants={textContainerVariants}
              className="flex flex-col items-center"
            >
              {/* State 1: Default */}
              <div className="h-20 md:h-24 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">Launch</span>
                <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">Project</span>
              </div>

              {/* State 2: Hover (Revealed) */}
              <div className="h-20 md:h-24 flex flex-col items-center justify-center text-gray-300">
                <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                  Let's Talk
                </span>
              </div>
            </motion.div>
          </div>

          {/* Subtle Glow Ring on Hover */}
          <div className="absolute inset-0 rounded-full border border-black/0 group-hover:border-black/10 group-hover:scale-110 transition-all duration-500" />
        </motion.button>

        <div className="mt-8 opacity-0 animate-pulse text-xs font-mono text-gray-400">
          CLICK TO SEND MAIL
        </div>
      </motion.div>

      <motion.footer
        className="w-full flex flex-col md:flex-row justify-between items-end border-t border-black pt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="font-black text-8xl md:text-9xl uppercase leading-[0.8] tracking-tighter -ml-2">9F</span>
          <span className="font-mono text-xs text-gray-400 mt-2">© 2025 All Rights Reserved.</span>
        </div>

        <div className="flex gap-8 font-mono text-sm mb-2 md:mr-24">
          <a href="https://x.com/9FStudioArt" target="_blank" rel="noreferrer" className="hover:line-through decoration-1" data-hover="true">TWITTER (X)</a>
          <a href="mailto:hello@9f.com" className="hover:line-through decoration-1" data-hover="true">HELLO@9F.COM</a>
        </div>
      </motion.footer>
    </section>
  );
};

export default Contact;
