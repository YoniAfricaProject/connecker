'use client';

import React, { useEffect, useState } from 'react';
import { Search, Shield, Building2, User, Loader2, Ban, CheckCircle } from 'lucide-react';
import { Card } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { logAction } from '@/lib/admin-log';

export default function UsersPage() {
  const { user: admin } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const supabase = getSupabase();
    supabase.from('users').select('*').order('created_at', { ascending: false }).then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  async function updateRole(u: any, role: string) {
    await getSupabase().from('users').update({ role }).eq('id', u.id);
    setUsers(users.map(x => x.id === u.id ? { ...x, role } : x));
    logAction(admin?.full_name || '', `Role -> ${role}`, 'user', u.id, u.full_name);
  }

  async function toggleBlock(u: any) {
    await getSupabase().from('users').update({ blocked: !u.blocked }).eq('id', u.id);
    setUsers(users.map(x => x.id === u.id ? { ...x, blocked: !u.blocked } : x));
    logAction(admin?.full_name || '', u.blocked ? 'Deblocage' : 'Blocage', 'user', u.id, u.full_name);
  }

  const filtered = users.filter(u => (roleFilter === 'all' || u.role === roleFilter) && (!search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())));

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-slate-900">Utilisateurs ({users.length})</h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'user', 'announcer', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${roleFilter === r ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {r === 'all' ? 'Tous' : r === 'user' ? 'Users' : r === 'announcer' ? 'Annonceurs' : 'Admins'}
            </button>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Utilisateur</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Role</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Tel</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Statut</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className={`hover:bg-slate-50 ${u.blocked ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3"><div className="text-xs font-medium text-slate-900">{u.full_name}</div><div className="text-[10px] text-slate-400">{u.email}</div></td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => updateRole(u, e.target.value)} className="text-[11px] rounded border border-slate-200 px-1.5 py-1">
                    <option value="user">Utilisateur</option><option value="announcer">Annonceur</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{u.phone || '-'}</td>
                <td className="px-4 py-3">{u.blocked ? <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Bloque</span> : <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Actif</span>}</td>
                <td className="px-4 py-3"><button onClick={() => toggleBlock(u)} className={`p-1 rounded ${u.blocked ? 'text-emerald-600' : 'text-red-500'}`}>{u.blocked ? <CheckCircle size={14} /> : <Ban size={14} />}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
