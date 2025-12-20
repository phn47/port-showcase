import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  to?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'md',
  asLink = false,
  to,
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-mono uppercase tracking-wider font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-3 group';
  
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-gray-200',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
    danger: 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500',
    success: 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500',
    warning: 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (asLink && to) {
    return (
      <Link to={to} className={classes}>
        {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
      {children}
    </button>
  );
};

