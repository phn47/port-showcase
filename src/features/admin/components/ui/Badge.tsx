import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'published' | 'draft' | 'archived' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = '',
}) => {
    const variantClasses = {
        published: 'bg-green-500/10 border-green-500/30 text-green-400',
        draft: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        archived: 'bg-red-500/10 border-red-500/30 text-red-400',
        default: 'bg-white/5 border-white/10 text-gray-400',
    };

    const baseClasses = 'px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold border';

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};
