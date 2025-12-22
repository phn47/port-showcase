import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    action,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between mb-12"
        >
            <div>
                <h1 className="text-7xl font-black uppercase tracking-tighter mb-4 leading-[0.9] text-white">{title}</h1>
                {subtitle && (
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-[0.3em]">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </motion.div>
    );
};
