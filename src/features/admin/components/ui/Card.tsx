import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    padding?: 'sm' | 'md' | 'lg' | 'none';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    className = '',
    padding = 'md',
    hover = false,
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        none: '',
    };

    const baseClasses = `bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm ${paddingClasses[padding]} ${hover ? 'hover:border-white/20 hover:bg-white/5 transition-all duration-300' : ''} ${className}`;

    return (
        <div className={baseClasses}>
            {title && (
                <div className="mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-mono uppercase tracking-[0.2em] font-bold text-gray-400">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
};
