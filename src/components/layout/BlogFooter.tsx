
import React from 'react';
import { motion } from 'framer-motion';

export const BlogFooter: React.FC = () => {
    return (
        <footer className="w-full bg-white px-8 pb-8 pt-32">
            <motion.div
                className="w-full flex flex-col md:flex-row justify-between items-end border-t border-black pt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 1 }}
            >
                <div className="flex flex-col mb-4 md:mb-0">
                    <span className="font-black text-8xl md:text-9xl uppercase leading-[0.8] tracking-tighter -ml-2">9F</span>
                    <span className="font-mono text-xs text-gray-400 mt-2">© 2025 All Rights Reserved.</span>
                </div>

                <div className="flex gap-8 font-mono text-sm mb-2 md:mr-24">
                    <a href="https://x.com/9FStudioArt" target="_blank" rel="noreferrer" className="hover:line-through decoration-1" data-hover="true">TWITTER (X)</a>
                    <a href="mailto:hello@9f.com" className="hover:line-through decoration-1" data-hover="true">HELLO@9F.COM</a>
                </div>
            </motion.div>
        </footer>
    );
};
