import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={
        `relative rounded-2xl p-6 min-w-0 overflow-hidden ` +
        // Subtle gradient surface with glassy feel
        `bg-gradient-to-br from-[#0a0f14] to-[#0b1113] ` +
        // Soft border and inner ring for depth
        `border border-white/8 ring-1 ring-white/5 ` +
        // Shadow similar to elevated cards in the mock
        `shadow-[0_8px_24px_rgba(0,0,0,0.45)] ` +
        // Interactive focus/hover polish (color only; no content change)
        `transition-colors hover:ring-[#7c3aed]/20 ${className}`
      }
    >
      {children}
    </div>
  );
}
