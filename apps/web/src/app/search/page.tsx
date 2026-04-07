'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';
import { PropertyCard, SearchBar, Button, Badge } from '@connecker/ui';
import { FEATURED_PROPERTIES } from '@/lib/mock-data';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus recentes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'surface_desc', label: 'Surface decroissante' },
];

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');

  const properties = FEATURED_PROPERTIES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Bar */}
      <SearchBar variant="compact" className="mb-6" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            {properties.length} biens trouves
          </h1>
          <Badge>{properties.length}</Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters toggle */}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} className="mr-2" />
            Filtres
          </Button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* View mode */}
          <div className="hidden sm:flex border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type de bien */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de bien</label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous les types</option>
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
                <option value="land">Terrain</option>
                <option value="studio">Studio</option>
                <option value="office">Bureau</option>
              </select>
            </div>

            {/* Budget min */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget min</label>
              <input
                type="number"
                placeholder="Min (XOF)"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Budget max */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget max</label>
              <input
                type="number"
                placeholder="Max (XOF)"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Surface min */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Surface min (m2)</label>
              <input
                type="number"
                placeholder="Min m2"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Chambres */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Chambres min</label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Peu importe</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
              <input
                type="text"
                placeholder="Ex: Dakar"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm">Reinitialiser</Button>
            <Button variant="primary" size="sm">Appliquer les filtres</Button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <PropertyCard property={property} />
          </Link>
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Precedent</Button>
          <span className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium">1</span>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Suivant</Button>
        </div>
      </div>
    </div>
  );
}
