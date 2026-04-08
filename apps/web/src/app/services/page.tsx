'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, MapPin, Phone, Mail, Search, Loader2 } from 'lucide-react';
import { Button, Card, Badge } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'Decorateur', label: 'Decorateurs' },
  { id: 'Expert immobilier', label: 'Experts' },
  { id: 'Banque', label: 'Banques' },
  { id: 'Geometre', label: 'Geometres' },
  { id: 'Sous-traitant', label: 'Sous-traitants' },
  { id: 'Promoteur', label: 'Promoteurs' },
  { id: 'Agence', label: 'Agences' },
  { id: 'Architecte', label: 'Architectes' },
  { id: 'Construction', label: 'Construction' },
  { id: 'Notaire', label: 'Notaires' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSupabase().from('services').select('*').eq('status', 'active').order('verified', { ascending: false })
      .then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  const filtered = services.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <Badge variant="new" className="mb-4">Annuaire professionnel</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Prestations de service</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Trouvez les meilleurs professionnels de l&apos;immobilier au Senegal.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher un professionnel..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => setSelectedCategory(id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === id ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500">Aucun professionnel trouve.{services.length === 0 ? ' Les pros seront bientot ajoutes.' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => (
            <Card key={provider.id} hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">{provider.name}</h3>
                      {provider.verified && (
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">✓</span>
                      )}
                    </div>
                    <Badge className="mt-1">{provider.category}</Badge>
                  </div>
                </div>
              </div>

              {provider.description && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{provider.description}</p>}

              <div className="space-y-2 mb-5">
                {(provider.city || provider.district) && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                    <span>{provider.district ? `${provider.district}, ` : ''}{provider.city}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} className="text-orange-400 flex-shrink-0" />
                    <span>{provider.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {provider.phone && (
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => window.open(`tel:${provider.phone}`)}>
                    <Phone size={14} className="mr-1" /> Appeler
                  </Button>
                )}
                {provider.email && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`mailto:${provider.email}`)}>
                    <Mail size={14} className="mr-1" /> Email
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <section className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Vous etes un professionnel ?</h2>
        <p className="text-slate-400 mb-6 max-w-xl mx-auto">Inscrivez-vous gratuitement dans notre annuaire.</p>
        <Link href="/contact"><Button variant="primary" size="lg">Rejoindre l&apos;annuaire <ArrowRight size={16} className="ml-2" /></Button></Link>
      </section>
    </div>
  );
}
