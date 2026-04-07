'use client';

import React, { useEffect, useState } from 'react';
import { Search, Shield, Building2, User, MoreVertical, Loader2 } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700' },
  announcer: { label: 'Annonceur', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  user: { label: 'Utilisateur', icon: User, color: 'bg-slate-100 text-slate-700' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateRole(userId: string, newRole: string) {
    const supabase = getSupabase();
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
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
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Telephone</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Inscription</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => {
              const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
              const Icon = rc.icon;
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-xs">
                        {u.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">{u.full_name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${rc.color}`}>
                      <Icon size={12} />{rc.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="user">Utilisateur</option>
                      <option value="announcer">Annonceur</option>
                      <option value="admin">Admin</option>
                    </select>
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
