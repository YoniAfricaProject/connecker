'use client';

import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';

interface SearchBarProps {
  onSearch?: (filters: { query: string; city: string; transaction_type: string }) => void;
  className?: string;
  variant?: 'hero' | 'compact';
}

export function SearchBar({ onSearch, className, variant = 'hero' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [transactionType, setTransactionType] = useState('sale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ query, city, transaction_type: transactionType });
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un bien..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <Button type="submit" size="sm">Rechercher</Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-900/10 p-2',
        className
      )}
    >
      {/* Transaction type toggle */}
      <div className="flex gap-1 mb-3 p-1 bg-slate-100 rounded-xl">
        {[
          { value: 'sale', label: 'Acheter' },
          { value: 'rent', label: 'Louer' },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTransactionType(value)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
              transactionType === value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search fields */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ville, quartier..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Appartement, villa, terrain..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtres</span>
          </button>

          <Button type="submit" size="lg" className="whitespace-nowrap">
            Rechercher
          </Button>
        </div>
      </div>
    </form>
  );
}
