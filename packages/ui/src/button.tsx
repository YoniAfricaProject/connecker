'use client';

import React from 'react';
import { cn } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/25': variant === 'primary',
          'bg-slate-900 text-white hover:bg-slate-800': variant === 'secondary',
          'border-2 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 bg-white': variant === 'outline',
          'text-slate-600 hover:text-orange-600 hover:bg-orange-50': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-7 py-3.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
