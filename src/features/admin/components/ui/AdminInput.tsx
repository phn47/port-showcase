import React from 'react';
import { Search } from 'lucide-react';

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const AdminInput: React.FC<AdminInputProps> = ({
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full bg-white/5 border border-white/10 px-4 py-4 focus:border-white focus:outline-none focus:bg-white/10 transition-all font-mono text-sm rounded-lg h-[48px]';
  
  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';

  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`${baseClasses} ${iconPadding} ${className}`}
        {...props}
      />
      {icon && iconPosition === 'right' && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  );
};

