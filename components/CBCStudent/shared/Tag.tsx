import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'green' | 'orange' | 'blue';
  className?: string;
}

export default function Tag({ children, variant = 'purple', className = '' }: TagProps) {
  const variantStyles = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
