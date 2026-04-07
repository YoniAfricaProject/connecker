'use client';

import React from 'react';
import { Heart, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';
import type { Property } from '@connecker/shared-types';
import { Card } from './card';
import { Badge } from './badge';
import { cn, formatPrice, formatSurface } from './utils';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export function PropertyCard({ property, onFavorite, isFavorite, className }: PropertyCardProps) {
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];

  return (
    <Card hover className={cn('group', className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300 text-4xl">🏠</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={property.transaction_type === 'sale' ? 'sale' : 'rent'}>
            {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
          </Badge>
        </div>

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); onFavorite(property.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart
              size={18}
              className={cn(
                'transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'
              )}
            />
          </button>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-bold text-lg">
            {formatPrice(property.price, property.currency)}
            {property.transaction_type === 'rent' && <span className="text-sm font-normal">/mois</span>}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <MapPin size={14} />
          <span className="line-clamp-1">{property.district ? `${property.district}, ` : ''}{property.city}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-slate-600 text-sm">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1.5">
              <BedDouble size={15} className="text-slate-400" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1.5">
              <Bath size={15} className="text-slate-400" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.surface_area != null && (
            <div className="flex items-center gap-1.5">
              <Maximize size={15} className="text-slate-400" />
              <span>{formatSurface(property.surface_area)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
