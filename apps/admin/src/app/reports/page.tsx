'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { logAction } from '@/lib/admin-log';
import { useAdminAuth } from '@/lib/auth-context';

export default function ReportsPage() {
  const { user: admin } = useAdminAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { getSupabase().from('reports').select('*, properties(title, city)').order('created_at', { ascending: false }).then(({ data }) => { setReports(data || []); setLoading(false); }); }, []);

  async function updateStatus(id: string, status: string) {
    await getSupabase().from('reports').update({ status }).eq('id', id);
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    logAction(admin?.full_name || '', `Signalement ${status}`, 'report', id);
  }

  async function deleteReport(r: any) {
    await getSupabase().from('reports').delete().eq('id', r.id);
    setReports(reports.filter(x => x.id !== r.id));
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Signalements</h1>
        {pendingCount > 0 && <Badge variant="new">{pendingCount} en attente</Badge>}
      </div>

      <div className="flex gap-1.5">
        {['all', 'pending', 'reviewed', 'dismissed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${filter === s ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'reviewed' ? 'Traites' : 'Rejetes'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Aucun signalement</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={r.status === 'pending' ? 'text-amber-500' : 'text-slate-300'} />
                    <span className="text-xs font-medium text-slate-900">{r.reason}</span>
                    <Badge variant={r.status === 'pending' ? 'new' : r.status === 'reviewed' ? 'sale' : 'default'}>
                      {r.status === 'pending' ? 'En attente' : r.status === 'reviewed' ? 'Traite' : 'Rejete'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{r.details}</p>
                  <div className="text-[10px] text-slate-400">
                    Annonce: {r.properties?.title || 'Supprimee'} | Par: {r.reporter_email} | {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex gap-1">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'reviewed')} className="p-1.5 rounded hover:bg-emerald-50"><CheckCircle size={14} className="text-emerald-500" /></button>
                      <button onClick={() => updateStatus(r.id, 'dismissed')} className="p-1.5 rounded hover:bg-slate-100"><Trash2 size={14} className="text-slate-400" /></button>
                    </>
                  )}
                  {r.status !== 'pending' && <button onClick={() => deleteReport(r)} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
