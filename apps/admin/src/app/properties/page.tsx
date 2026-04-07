'use client';

import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';

const ALL_PROPERTIES = [
  { id: '1', title: 'Villa moderne avec piscine', announcer: 'Agence Dakar Immo', city: 'Dakar', price: 285000000, status: 'published', date: '2026-04-01' },
  { id: '2', title: 'Appartement T3 Plateau', announcer: 'Fatou Ndiaye', city: 'Dakar', price: 850000, status: 'published', date: '2026-04-02' },
  { id: '3', title: 'Terrain 500m2 Saly', announcer: 'Ibrahima Fall', city: 'Mbour', price: 45000000, status: 'pending', date: '2026-04-07' },
  { id: '4', title: 'Studio meuble Mermoz', announcer: 'SCI Habitat', city: 'Dakar', price: 350000, status: 'published', date: '2026-04-05' },
  { id: '5', title: 'Villa standing Ngor', announcer: 'Agence Touba Immo', city: 'Dakar', price: 320000000, status: 'pending', date: '2026-04-07' },
  { id: '6', title: 'Bureau Plateau', announcer: 'Bureau Plus SARL', city: 'Dakar', price: 1200000, status: 'rejected', date: '2026-04-03' },
];

export default function AdminPropertiesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ALL_PROPERTIES
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.announcer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestion des annonces</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Rechercher une annonce..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'published', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === s ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
              {s === 'all' ? 'Toutes' : s === 'pending' ? 'En attente' : s === 'published' ? 'Publiees' : 'Rejetees'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Annonce</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Annonceur</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Ville</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Prix</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Statut</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-sm text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.date}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.announcer}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.city}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatPrice(p.price)}</td>
                <td className="px-6 py-4">
                  <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                    {p.status === 'published' ? 'Publiee' : p.status === 'pending' ? 'En attente' : 'Rejetee'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Eye size={16} /></button>
                    {p.status === 'pending' && (
                      <>
                        <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><CheckCircle size={16} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><XCircle size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
