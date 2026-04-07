'use client';

import React from 'react';
import { cn } from './utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
}
