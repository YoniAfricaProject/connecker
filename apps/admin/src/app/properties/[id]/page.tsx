'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Loader2, MapPin, BedDouble, Bath, Maximize, Building2, Trash2, Eye } from 'lucide-react';
import { Button, Badge, Card } from '@connecker/ui';
import { formatPrice, formatSurface } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(*), users!announcer_id(*)')
        .eq('id', params.id)
        .single();
      setProperty(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function updateStatus(status: 'published' | 'rejected') {
    const supabase = getSupabase();
    await supabase.from('properties').update({ status }).eq('id', params.id);
    setProperty({ ...property, status });
  }

  async function deleteImage(imageId: string) {
    const supabase = getSupabase();
    await supabase.from('property_images').delete().eq('id', imageId);
    setProperty({
      ...property,
      property_images: property.property_images.filter((i: any) => i.id !== imageId),
    });
  }

  async function deleteProperty() {
    if (!confirm('Supprimer definitivement cette annonce et toutes ses photos ?')) return;
    const supabase = getSupabase();
    await supabase.from('properties').delete().eq('id', params.id);
    router.push('/properties');
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-500" /></div>;
  if (!property) return <div className="text-center py-20 text-slate-500">Annonce non trouvee</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/properties" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-slate-900 flex-1">Detail de l&apos;annonce</h1>
        <Badge variant={property.status === 'published' ? 'sale' : property.status === 'pending' ? 'new' : 'default'} className="text-sm">
          {property.status === 'published' ? 'Publiee' : property.status === 'pending' ? 'En attente' : 'Rejetee'}
        </Badge>
      </div>

      {/* Actions */}
      <Card className="p-4 flex items-center gap-3">
        {property.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => updateStatus('published')}>
              <CheckCircle size={16} className="mr-2" />Approuver et publier
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateStatus('rejected')}>
              <XCircle size={16} className="mr-2" />Rejeter
            </Button>
          </>
        )}
        {property.status === 'published' && (
          <Button variant="outline" size="sm" onClick={() => updateStatus('rejected')}>
            <XCircle size={16} className="mr-2" />Depublier
          </Button>
        )}
        {property.status === 'rejected' && (
          <Button variant="primary" size="sm" onClick={() => updateStatus('published')}>
            <CheckCircle size={16} className="mr-2" />Republier
          </Button>
        )}
        <a href={`https://connecker.vercel.app/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm"><Eye size={16} className="mr-2" />Voir sur le site</Button>
        </a>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={deleteProperty} className="text-red-600 hover:bg-red-50">
          <Trash2 size={16} className="mr-2" />Supprimer
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{property.title}</h2>
            <div className="flex items-center gap-2 text-slate-500"><MapPin size={16} className="text-orange-500" />{property.district}, {property.city}</div>
            <div className="text-2xl font-bold text-orange-600">{formatPrice(property.price, property.currency)}{property.transaction_type === 'rent' ? '/mois' : ''}</div>

            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="text-center"><div className="text-sm font-bold text-slate-900">{property.surface_area ? formatSurface(property.surface_area) : '-'}</div><div className="text-xs text-slate-400">Surface</div></div>
              <div className="text-center"><div className="text-sm font-bold text-slate-900">{property.bedrooms ?? '-'}</div><div className="text-xs text-slate-400">Chambres</div></div>
              <div className="text-center"><div className="text-sm font-bold text-slate-900">{property.bathrooms ?? '-'}</div><div className="text-xs text-slate-400">SdB</div></div>
              <div className="text-center"><div className="text-sm font-bold text-slate-900">{property.rooms ?? '-'}</div><div className="text-xs text-slate-400">Pieces</div></div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {property.features?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm mb-2">Equipements</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((f: string) => (
                    <span key={f} className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Photos - moderation */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Photos ({property.property_images?.length || 0})</h3>
            {property.property_images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.property_images.map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200">
                    <img src={img.url} alt="" className="w-full h-32 object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Principale</span>
                    )}
                    <button onClick={() => deleteImage(img.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aucune photo</p>
            )}
          </Card>
        </div>

        {/* Sidebar - announcer info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Annonceur</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                  {property.users?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{property.users?.full_name}</div>
                  <div className="text-xs text-slate-400">{property.users?.email}</div>
                </div>
              </div>
              {property.users?.phone && <div className="text-sm text-slate-600">Tel: {property.users.phone}</div>}
              {property.users?.company_name && <div className="text-sm text-slate-600">Entreprise: {property.users.company_name}</div>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Vues</span><span className="font-medium">{property.views_count}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Leads</span><span className="font-medium">{property.leads_count}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Cree le</span><span className="font-medium">{new Date(property.created_at).toLocaleDateString('fr-FR')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Expire le</span><span className="font-medium">{new Date(property.expires_at).toLocaleDateString('fr-FR')}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
