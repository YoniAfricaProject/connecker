'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, MessageSquare, Edit, Trash2, Building2, Loader2 } from 'lucide-react';
import { Button, Badge, Card } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';

export default function DashboardPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }

    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .eq('announcer_id', user!.id)
        .order('created_at', { ascending: false });

      setProperties(data || []);
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    const supabase = getSupabase();
    await supabase.from('properties').delete().eq('id', id);
    setProperties(properties.filter(p => p.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mes annonces</h1>
        <Link href="/dashboard/properties/new">
          <Button variant="primary" size="sm"><Plus size={16} className="mr-2" />Nouvelle annonce</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Building2 size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">Vous n&apos;avez pas encore d&apos;annonce</p>
          <Link href="/dashboard/properties/new"><Button variant="primary" size="sm">Publier une annonce</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const image = prop.property_images?.find((i: any) => i.is_primary) || prop.property_images?.[0];
            return (
              <Card key={prop.id} className="p-4">
                <div className="flex gap-4">
                  {image ? (
                    <img src={image.url} alt={prop.title} className="w-28 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{prop.title}</h3>
                        <p className="text-xs text-slate-500">{prop.city}</p>
                      </div>
                      <Badge variant={prop.status === 'published' ? 'sale' : prop.status === 'pending' ? 'new' : 'default'}>
                        {prop.status === 'published' ? 'Active' : prop.status === 'pending' ? 'En attente' : prop.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="font-bold text-orange-600 text-sm">{formatPrice(prop.price, prop.currency)}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Eye size={12} />{prop.views_count}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MessageSquare size={12} />{prop.leads_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(prop.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
