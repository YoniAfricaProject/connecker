'use client';

import React from 'react';
import { cn } from './utils';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  light?: boolean;
}

export function Logo({ variant = 'full', className, light = false }: LogoProps) {
  const textColor = light ? 'text-white' : 'text-slate-900';
  const accentColor = 'text-orange-600';

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={accentColor}>
          <path
            d="M20 4L4 18h5v14h22V18h5L20 4z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M20 4L4 18h5v14h22V18h5L20 4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="15" y="22" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className={accentColor}>
        <path
          d="M20 4L4 18h5v14h22V18h5L20 4z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M20 4L4 18h5v14h22V18h5L20 4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="15" y="22" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={cn('text-xl font-bold tracking-tight', textColor)}>
          Connec&apos;<span className={accentColor}>Kër</span>
        </span>
        <span className={cn('text-[10px] tracking-widest uppercase', light ? 'text-white/60' : 'text-slate-400')}>
          ku nek ak sa kër
        </span>
      </div>
    </div>
  );
}
