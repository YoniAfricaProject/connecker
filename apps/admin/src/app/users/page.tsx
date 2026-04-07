'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, Shield, Building2, User } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';

const USERS = [
  { id: '1', name: 'Amadou Diallo', email: 'amadou@email.com', role: 'user' as const, properties: 0, date: '2026-03-15' },
  { id: '2', name: 'Agence Dakar Immo', email: 'contact@dakarimmo.sn', role: 'announcer' as const, properties: 12, date: '2026-02-10' },
  { id: '3', name: 'Fatou Ndiaye', email: 'fatou@email.com', role: 'announcer' as const, properties: 5, date: '2026-03-20' },
  { id: '4', name: 'Admin Connecker', email: 'admin@connecker.com', role: 'admin' as const, properties: 0, date: '2026-01-01' },
  { id: '5', name: 'Moussa Sow', email: 'moussa@email.com', role: 'user' as const, properties: 0, date: '2026-04-01' },
  { id: '6', name: 'SCI Dakar Invest', email: 'info@dakarinvest.sn', role: 'announcer' as const, properties: 8, date: '2026-02-28' },
];

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700' },
  announcer: { label: 'Annonceur', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  user: { label: 'Utilisateur', icon: User, color: 'bg-slate-100 text-slate-700' },
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = USERS
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'user', 'announcer', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${roleFilter === r ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {r === 'all' ? 'Tous' : r === 'user' ? 'Utilisateurs' : r === 'announcer' ? 'Annonceurs' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Utilisateur</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Role</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Annonces</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Inscription</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => {
              const rc = ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG];
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-xs">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${rc.color}`}>
                      <rc.icon size={12} />{rc.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.properties}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.date}</td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
