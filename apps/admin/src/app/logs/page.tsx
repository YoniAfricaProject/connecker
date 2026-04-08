'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import { Card } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

const ACTION_COLORS: Record<string, string> = {
  'Blocage': 'text-red-600 bg-red-50',
  'Deblocage': 'text-emerald-600 bg-emerald-50',
  'Suppression': 'text-red-600 bg-red-50',
  'Verification': 'text-blue-600 bg-blue-50',
  'Approbation': 'text-emerald-600 bg-emerald-50',
  'Rejet': 'text-amber-600 bg-amber-50',
};

function getActionColor(action: string) {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return 'text-slate-600 bg-slate-50';
}

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSupabase().from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.admin_name?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-slate-900">Historique des actions ({logs.length})</h1>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Rechercher dans les logs..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Aucun log</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b"><tr>
              <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Date</th>
              <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Admin</th>
              <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Action</th>
              <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Cible</th>
              <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Details</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-900">{l.admin_name || '-'}</td>
                  <td className="px-4 py-2.5"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getActionColor(l.action)}`}>{l.action}</span></td>
                  <td className="px-4 py-2.5 text-[10px] text-slate-500">{l.target_type || '-'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{l.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
