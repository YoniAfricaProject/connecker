'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Building2, ChevronDown, X, BedDouble, Maximize, Banknote, Home as HomeIcon } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { DAKAR_COMMUNES, OTHER_CITIES, PROPERTY_TYPE_OPTIONS } from './dakar-data';

export const FEATURE_OPTIONS = [
  'Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur',
  'Balcon', 'Terrasse', 'Gardien', 'Parking', 'Vue mer',
  'Meuble', 'Wifi', 'Cuisine equipee', 'Titre foncier',
];

interface SearchBarProps {
  onSearch?: (filters: {
    query: string; city: string; district: string;
    transaction_type: string; property_type: string;
    price_min: string; price_max: string;
    surface_min: string; surface_max: string;
    rooms_min: string; bedrooms_min: string;
    features: string[];
  }) => void;
  className?: string;
  variant?: 'hero' | 'compact';
}

function buildSearchUrl(params: Record<string, string>) {
  const url = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) url.set(k, v); });
  return `/search?${url.toString()}`;
}

export function SearchBar({ onSearch, className, variant = 'hero' }: SearchBarProps) {
  const [commune, setCommune] = useState('');
  const [district, setDistrict] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [transactionType, setTransactionType] = useState('sale');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [surfaceMin, setSurfaceMin] = useState('');
  const [surfaceMax, setSurfaceMax] = useState('');
  const [roomsMin, setRoomsMin] = useState('');
  const [bedroomsMin, setBedroomsMin] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const quartiers = useMemo(() => {
    if (!commune) return [];
    return DAKAR_COMMUNES[commune] || [];
  }, [commune]);

  const activeFiltersCount =
    [priceMin, priceMax, surfaceMin, surfaceMax, roomsMin, bedroomsMin].filter(Boolean).length + features.length;

  const toggleFeature = (f: string) => {
    setFeatures((arr) => (arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters = {
      query: propertyType,
      city: commune || '',
      district: district || '',
      transaction_type: transactionType,
      property_type: propertyType,
      price_min: priceMin,
      price_max: priceMax,
      surface_min: surfaceMin,
      surface_max: surfaceMax,
      rooms_min: roomsMin,
      bedrooms_min: bedroomsMin,
      features,
    };
    if (onSearch) {
      onSearch(filters);
    } else {
      window.location.href = buildSearchUrl({
        type: transactionType,
        city: commune,
        district,
        property_type: propertyType,
        price_min: priceMin,
        price_max: priceMax,
        surface_min: surfaceMin,
        surface_max: surfaceMax,
        rooms_min: roomsMin,
        bedrooms_min: bedroomsMin,
        features: features.join(','),
      });
    }
  };

  const handleCommuneChange = (value: string) => {
    setCommune(value);
    setDistrict('');
  };

  const resetFilters = () => {
    setPriceMin(''); setPriceMax('');
    setSurfaceMin(''); setSurfaceMax('');
    setRoomsMin(''); setBedroomsMin('');
    setFeatures([]);
  };

  const selectClass = 'w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 pr-10 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer';
  const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400';

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex flex-wrap items-center gap-2', className)}>
        <div className="relative flex-1 min-w-[180px]">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={commune} onChange={(e) => handleCommuneChange(e.target.value)}
            className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">Ville / Commune</option>
            <optgroup label="Dakar">
              {Object.keys(DAKAR_COMMUNES).map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Autres villes">
              {OTHER_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {quartiers.length > 0 && (
          <div className="relative min-w-[150px]">
            <select value={district} onChange={(e) => setDistrict(e.target.value)}
              className="w-full appearance-none px-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Quartier</option>
              {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}

        <div className="relative min-w-[150px]">
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
            className="w-full appearance-none px-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            {PROPERTY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <Button type="submit" size="sm">Rechercher</Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-900/10 p-4 sm:p-5',
        className
      )}
    >
      {/* Transaction type toggle */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
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

      {/* Row 1: Commune + Quartier */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 z-10" />
          <select
            value={commune}
            onChange={(e) => handleCommuneChange(e.target.value)}
            className={cn(selectClass, 'pl-10')}
          >
            <option value="">Ville, commune...</option>
            <optgroup label="-- Dakar --">
              {Object.keys(DAKAR_COMMUNES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
            <optgroup label="-- Autres villes --">
              {OTHER_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 z-10" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={quartiers.length === 0}
            className={cn(selectClass, 'pl-10', quartiers.length === 0 && 'opacity-50 cursor-not-allowed')}
          >
            <option value="">{quartiers.length > 0 ? 'Choisir un quartier...' : 'Selectionnez une commune d\'abord'}</option>
            {quartiers.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Row 2: Property type + Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 z-10" />
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className={cn(selectClass, 'pl-10')}
          >
            {PROPERTY_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm transition-colors',
              showFilters
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600'
            )}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <Button type="submit" size="lg" className="whitespace-nowrap px-8">
            Rechercher
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Filtres avances</h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button type="button" onClick={resetFilters} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                  Reinitialiser
                </button>
              )}
              <button type="button" onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Banknote size={12} /> Budget min (XOF)
              </label>
              <input type="number" placeholder="Ex: 100 000" value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Banknote size={12} /> Budget max (XOF)
              </label>
              <input type="number" placeholder="Ex: 50 000 000" value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Maximize size={12} /> Surface min (m²)
              </label>
              <input type="number" placeholder="Ex: 50" value={surfaceMin}
                onChange={(e) => setSurfaceMin(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Maximize size={12} /> Surface max (m²)
              </label>
              <input type="number" placeholder="Ex: 200" value={surfaceMax}
                onChange={(e) => setSurfaceMax(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <HomeIcon size={12} /> Pièces min
              </label>
              <div className="relative">
                <select value={roomsMin} onChange={(e) => setRoomsMin(e.target.value)}
                  className={cn(inputClass, 'appearance-none pr-8')}>
                  <option value="">Peu importe</option>
                  <option value="1">1+</option><option value="2">2+</option>
                  <option value="3">3+</option><option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <BedDouble size={12} /> Chambres min
              </label>
              <div className="relative">
                <select value={bedroomsMin} onChange={(e) => setBedroomsMin(e.target.value)}
                  className={cn(inputClass, 'appearance-none pr-8')}>
                  <option value="">Peu importe</option>
                  <option value="1">1+</option><option value="2">2+</option>
                  <option value="3">3+</option><option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Équipements</label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((f) => {
                const active = features.includes(f);
                return (
                  <button key={f} type="button" onClick={() => toggleFeature(f)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      active
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                    )}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
