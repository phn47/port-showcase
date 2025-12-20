import React from 'react';
import { motion } from 'framer-motion';

export const BlogFooter: React.FC = () => {
    return (
        <footer className="w-full bg-white px-8 pt-20 pb-8">
            <motion.div
                className="w-full flex flex-col md:flex-row justify-between items-end border-t border-black pt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="flex flex-col mb-8 md:mb-0">
                    <span className="font-black text-8xl md:text-[10rem] uppercase leading-[0.8] tracking-tighter -ml-2 lg:-ml-4">9F</span>
                    <span className="font-mono text-xs text-gray-400 mt-4 uppercase tracking-widest pl-2">© 2025 All Rights Reserved.</span>
                </div>

                <div className="flex gap-8 font-mono text-sm mb-4 uppercase tracking-widest">
                    <a href="https://x.com/9FStudioArt" target="_blank" rel="noreferrer" className="hover:line-through decoration-1 transition-all" data-hover="true">Twitter (X)</a>
                    <a href="mailto:hello@9f.com" className="hover:line-through decoration-1 transition-all" data-hover="true">hello@9f.com</a>
                </div>
            </motion.div>
        </footer>
    );
};
