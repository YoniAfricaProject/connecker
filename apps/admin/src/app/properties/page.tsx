'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, CheckCircle, XCircle, Loader2, ChevronDown } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProperties(); }, [filter]);

  async function fetchProperties() {
    setLoading(true);
    const supabase = getSupabase();
    let query = supabase
      .from('properties')
      .select('*, users!announcer_id(full_name, email), property_images(url, is_primary)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    setProperties(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'published' | 'rejected') {
    const supabase = getSupabase();
    await supabase.from('properties').update({ status }).eq('id', id);
    setProperties(properties.map(p => p.id === id ? { ...p, status } : p));
  }

  async function deleteProperty(id: string) {
    if (!confirm('Supprimer definitivement cette annonce ?')) return;
    const supabase = getSupabase();
    await supabase.from('properties').delete().eq('id', id);
    setProperties(properties.filter(p => p.id !== id));
  }

  const filtered = properties.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.users?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    published: properties.filter(p => p.status === 'published').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestion des annonces</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'published', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === s ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
              {s === 'all' ? 'Toutes' : s === 'pending' ? 'En attente' : s === 'published' ? 'Publiees' : 'Rejetees'}
              <span className="ml-1 opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Annonce</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Annonceur</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Prix</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img.url} alt="" className="w-12 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🏠</div>
                        )}
                        <div>
                          <div className="font-medium text-sm text-slate-900 max-w-[200px] truncate">{p.title}</div>
                          <div className="text-xs text-slate-400">{p.city} - {p.property_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{p.users?.full_name}</div>
                      <div className="text-xs text-slate-400">{p.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatPrice(p.price, p.currency)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                        {p.status === 'published' ? 'Publiee' : p.status === 'pending' ? 'En attente' : 'Rejetee'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Link href={`/properties/${p.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Eye size={16} /></button>
                        </Link>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(p.id, 'published')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><CheckCircle size={16} /></button>
                            <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><XCircle size={16} /></button>
                          </>
                        )}
                        {p.status !== 'pending' && (
                          <button onClick={() => deleteProperty(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><XCircle size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">Aucune annonce trouvee</div>
          )}
        </Card>
      )}
    </div>
  );
}
