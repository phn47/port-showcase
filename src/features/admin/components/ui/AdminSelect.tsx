import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AdminSelect: React.FC<AdminSelectProps> = ({
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'bg-white/5 border border-white/10 px-6 py-3 focus:border-white focus:outline-none focus:bg-white/10 transition-all font-mono uppercase text-sm text-white rounded-lg appearance-none cursor-pointer pr-10 min-w-[160px] h-[48px]';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`relative ${widthClass}`}>
      <select className={`${baseClasses} ${widthClass} ${className}`} {...props}>
        {props.children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

