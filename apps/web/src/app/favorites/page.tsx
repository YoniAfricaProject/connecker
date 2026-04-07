'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { PropertyCard, Button } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';
import { toggleFavorite } from '@/lib/favorites';
import type { Property } from '@connecker/shared-types';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('favorites')
        .select('property_id, properties:property_id(*, property_images(*))')
        .eq('user_id', user!.id);

      const props = (data || []).map((f: any) => ({
        ...f.properties,
        images: (f.properties?.property_images || []).map((img: any) => ({
          id: img.id, url: img.url, caption: img.caption,
          is_primary: img.is_primary, order: img.sort_order,
        })),
      }));
      setProperties(props);
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  const handleRemove = async (propertyId: string) => {
    if (!user) return;
    await toggleFavorite(user.id, propertyId, true);
    setProperties(properties.filter(p => p.id !== propertyId));
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart size={48} className="text-slate-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connectez-vous pour voir vos favoris</h1>
        <p className="text-slate-500 mb-6">Sauvegardez vos biens preferes et retrouvez-les facilement.</p>
        <Link href="/auth/login"><Button variant="primary">Se connecter</Button></Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Mes favoris</h1>
      <p className="text-slate-500 mb-8">{properties.length} bien{properties.length > 1 ? 's' : ''} sauvegarde{properties.length > 1 ? 's' : ''}</p>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Aucun favori pour le moment</h2>
          <p className="text-slate-500 mb-6">Parcourez les annonces et cliquez sur le coeur pour sauvegarder.</p>
          <Link href="/search"><Button variant="primary">Explorer les biens</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <PropertyCard property={property} onFavorite={() => handleRemove(property.id)} isFavorite={true} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
