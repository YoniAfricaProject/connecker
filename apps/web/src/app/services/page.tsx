'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sofa, Star, Landmark, Ruler, HardHat, Megaphone, Building, Compass,
  Building2, Scale, ArrowRight, MapPin, Phone, Mail, ExternalLink, Search
} from 'lucide-react';
import { Button, Input, Card, Badge } from '@connecker/ui';

const SERVICE_CATEGORIES = [
  { id: 'decorators', label: 'Decorateurs d\'interieur', icon: Sofa, color: 'bg-pink-100 text-pink-600', count: 24 },
  { id: 'experts', label: 'Experts immobiliers', icon: Star, color: 'bg-amber-100 text-amber-600', count: 18 },
  { id: 'banks', label: 'Banques & Financement', icon: Landmark, color: 'bg-blue-100 text-blue-600', count: 12 },
  { id: 'surveyors', label: 'Geometres', icon: Ruler, color: 'bg-emerald-100 text-emerald-600', count: 15 },
  { id: 'contractors', label: 'Sous-traitants', icon: HardHat, color: 'bg-orange-100 text-orange-600', count: 32 },
  { id: 'promoters', label: 'Promoteurs immobiliers', icon: Megaphone, color: 'bg-purple-100 text-purple-600', count: 21 },
  { id: 'agencies', label: 'Agences immobilieres', icon: Building, color: 'bg-sky-100 text-sky-600', count: 45 },
  { id: 'architects', label: 'Architectes', icon: Compass, color: 'bg-indigo-100 text-indigo-600', count: 28 },
  { id: 'construction', label: 'Entreprises de construction', icon: Building2, color: 'bg-slate-100 text-slate-600', count: 36 },
  { id: 'notaries', label: 'Notaires', icon: Scale, color: 'bg-rose-100 text-rose-600', count: 9 },
];

const FEATURED_PROVIDERS = [
  { id: '1', name: 'Agence Dakar Immo', category: 'Agence immobiliere', city: 'Dakar', district: 'Plateau', phone: '+221 33 823 45 67', email: 'contact@dakarimmo.sn', rating: 4.8, reviews: 124, verified: true },
  { id: '2', name: 'Archi Design Sn', category: 'Architecte', city: 'Dakar', district: 'Almadies', phone: '+221 77 654 32 10', email: 'info@archidesign.sn', rating: 4.9, reviews: 87, verified: true },
  { id: '3', name: 'BHS - Banque de l\'Habitat', category: 'Banque', city: 'Dakar', district: 'Plateau', phone: '+221 33 839 77 77', email: 'contact@bhs.sn', rating: 4.5, reviews: 203, verified: true },
  { id: '4', name: 'Touba Immobilier', category: 'Promoteur', city: 'Dakar', district: 'Mermoz', phone: '+221 33 867 89 01', email: 'info@toubaimmo.sn', rating: 4.7, reviews: 56, verified: true },
  { id: '5', name: 'Maitre Ndiaye & Associes', category: 'Notaire', city: 'Dakar', district: 'Plateau', phone: '+221 33 821 11 22', email: 'etude@ndiaye-notaires.sn', rating: 4.6, reviews: 42, verified: true },
  { id: '6', name: 'Senegal Deco', category: 'Decorateur d\'interieur', city: 'Dakar', district: 'Point E', phone: '+221 77 888 99 00', email: 'hello@senegaldeco.com', rating: 4.4, reviews: 31, verified: false },
];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredProviders = FEATURED_PROVIDERS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="new" className="mb-4">Annuaire professionnel</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Prestations de service</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Trouvez les meilleurs professionnels de l&apos;immobilier au Senegal : agences, architectes, notaires, banques et bien plus.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un professionnel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SERVICE_CATEGORIES.map(({ id, label, icon: Icon, color, count }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 text-center ${
                selectedCategory === id
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                  : 'border-slate-100 bg-white hover:border-orange-200 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={24} />
              </div>
              <span className="font-medium text-slate-900 text-sm leading-tight">{label}</span>
              <span className="text-xs text-slate-400">{count} pros</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Professionnels recommandes</h2>
          <span className="text-sm text-slate-500">{filteredProviders.length} resultats</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
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

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(provider.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-900">{provider.rating}</span>
                <span className="text-xs text-slate-400">({provider.reviews} avis)</span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                  <span>{provider.district}, {provider.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={14} className="text-orange-400 flex-shrink-0" />
                  <span>{provider.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1">
                  <Phone size={14} className="mr-1" /> Appeler
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail size={14} className="mr-1" /> Email
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Vous etes un professionnel ?</h2>
        <p className="text-slate-400 mb-6 max-w-xl mx-auto">
          Inscrivez-vous gratuitement dans notre annuaire et recevez des demandes qualifiees de clients.
        </p>
        <Link href="/auth/register">
          <Button variant="primary" size="lg">
            Rejoindre l&apos;annuaire <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
