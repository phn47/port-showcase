import React from 'react';
import { motion } from 'framer-motion';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  children,
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
      {children}
    </div>
  );
};

