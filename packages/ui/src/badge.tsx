'use client';

import React from 'react';
import { cn } from './utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'rent' | 'new' | 'premium';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold',
        {
          'bg-slate-100 text-slate-700': variant === 'default',
          'bg-emerald-100 text-emerald-700': variant === 'sale',
          'bg-blue-100 text-blue-700': variant === 'rent',
          'bg-orange-100 text-orange-700': variant === 'new',
          'bg-amber-100 text-amber-700': variant === 'premium',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
