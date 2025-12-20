import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface AdminActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  to?: string;
  variant?: 'default' | 'danger';
  title?: string;
}

export const AdminActionButton: React.FC<AdminActionButtonProps> = ({
  icon: Icon,
  onClick,
  to,
  variant = 'default',
  title,
}) => {
  const baseClasses = 'p-2.5 rounded-lg transition-all hover:scale-110';
  const variantClasses = {
    default: 'hover:bg-white/10 text-gray-400 hover:text-white',
    danger: 'hover:bg-red-500/20 text-gray-400 hover:text-red-400',
  };

  const classes = `${baseClasses} ${variantClasses[variant]}`;

  if (to) {
    return (
      <Link to={to} className={classes} title={title}>
        <Icon size={16} />
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} title={title}>
      <Icon size={16} />
    </button>
  );
};

