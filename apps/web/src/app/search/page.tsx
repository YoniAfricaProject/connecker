'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, List, ChevronDown, Loader2 } from 'lucide-react';
import { PropertyCard, SearchBar, Button, Badge } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import type { Property } from '@connecker/shared-types';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-500" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus recentes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'surface_desc', label: 'Surface decroissante' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filter state - sync with URL params
  const [filters, setFilters] = useState({
    propertyType: searchParams.get('property_type') || '',
    transactionType: searchParams.get('type') || '',
    city: searchParams.get('city') || searchParams.get('q') || '',
    district: searchParams.get('district') || '',
    priceMin: '',
    priceMax: '',
    surfaceMin: '',
    bedroomsMin: '',
  });

  // Re-sync filters when URL params change
  useEffect(() => {
    setFilters(f => ({
      ...f,
      propertyType: searchParams.get('property_type') || f.propertyType,
      transactionType: searchParams.get('type') || '',
      city: searchParams.get('city') || searchParams.get('q') || f.city,
      district: searchParams.get('district') || f.district,
    }));
    setPage(1);
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    let query = supabase
      .from('properties')
      .select('*, property_images(*)', { count: 'exact' })
      .eq('status', 'published');

    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters.district) query = query.ilike('district', `%${filters.district}%`);
    if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
    if (filters.priceMin) query = query.gte('price', Number(filters.priceMin));
    if (filters.priceMax) query = query.lte('price', Number(filters.priceMax));
    if (filters.surfaceMin) query = query.gte('surface_area', Number(filters.surfaceMin));
    if (filters.bedroomsMin) query = query.gte('bedrooms', Number(filters.bedroomsMin));

    const sortMap: Record<string, [string, { ascending: boolean }]> = {
      price_asc: ['price', { ascending: true }],
      price_desc: ['price', { ascending: false }],
      date_desc: ['created_at', { ascending: false }],
      surface_desc: ['surface_area', { ascending: false }],
    };
    const [col, opts] = sortMap[sortBy] || sortMap.date_desc;
    query = query.order(col, opts);

    const limit = 12;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count } = await query;

    setProperties(
      (data || []).map((row: any) => ({
        ...row,
        images: (row.property_images || []).map((img: any) => ({
          id: img.id, url: img.url, caption: img.caption,
          is_primary: img.is_primary, order: img.sort_order,
        })),
      }))
    );
    setTotal(count || 0);
    setLoading(false);
  }, [filters, sortBy, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SearchBar
        variant="compact"
        className="mb-6"
        onSearch={({ query, city }) => {
          setFilters(f => ({ ...f, city: city || query }));
          setPage(1);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            {loading ? 'Recherche...' : `${total} bien${total > 1 ? 's' : ''} trouve${total > 1 ? 's' : ''}`}
          </h1>
          {!loading && <Badge>{total}</Badge>}
        </div>

        <div className="flex items-center gap-3">
          <Button variant={showFilters ? 'primary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} className="mr-2" />Filtres
          </Button>

          <div className="relative">
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="hidden sm:flex border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid3X3 size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de bien</label>
              <select value={filters.propertyType} onChange={e => setFilters(f => ({ ...f, propertyType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous les types</option>
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
                <option value="land">Terrain</option>
                <option value="studio">Studio</option>
                <option value="office">Bureau</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget min (XOF)</label>
              <input type="number" placeholder="Min" value={filters.priceMin} onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget max (XOF)</label>
              <input type="number" placeholder="Max" value={filters.priceMax} onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
              <input type="text" placeholder="Ex: Dakar" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Surface min (m2)</label>
              <input type="number" placeholder="Min m2" value={filters.surfaceMin} onChange={e => setFilters(f => ({ ...f, surfaceMin: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Chambres min</label>
              <select value={filters.bedroomsMin} onChange={e => setFilters(f => ({ ...f, bedroomsMin: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Peu importe</option>
                <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setFilters({ propertyType: '', transactionType: '', city: '', district: '', priceMin: '', priceMax: '', surfaceMin: '', bedroomsMin: '' }); setPage(1); }}>Reinitialiser</Button>
            <Button variant="primary" size="sm" onClick={() => { setPage(1); fetchProperties(); }}>Appliquer</Button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-slate-500">Aucun bien trouve pour ces criteres.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setFilters({ propertyType: '', transactionType: '', city: '', district: '', priceMin: '', priceMax: '', surfaceMin: '', bedroomsMin: '' }); setPage(1); }}>
            Reinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Precedent</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${p === page ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                {p}
              </button>
            ))}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}
    </div>
  );
}
