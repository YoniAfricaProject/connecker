'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { logAction } from '@/lib/admin-log';
import { useAdminAuth } from '@/lib/auth-context';

const PACKS = ['Pack Standard', 'Pack Premium', 'Pack Entreprise', 'Banniere pleine page', 'Banniere deroulante', 'Annonce demi-page', 'Lien sponsorise'];

export default function ContractsPage() {
  const { user: admin } = useAdminAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', pack: PACKS[0], amount: '', start_date: '', end_date: '', status: 'active' });

  useEffect(() => { getSupabase().from('ad_contracts').select('*').order('created_at', { ascending: false }).then(({ data }) => { setContracts(data || []); setLoading(false); }); }, []);

  async function handleSave() {
    const { data } = await getSupabase().from('ad_contracts').insert({ ...form, amount: Number(form.amount) }).select().single();
    if (data) setContracts([data, ...contracts]);
    logAction(admin?.full_name || '', 'Nouveau contrat pub', 'contract', data?.id, `${form.client_name} - ${form.pack}`);
    setForm({ client_name: '', pack: PACKS[0], amount: '', start_date: '', end_date: '', status: 'active' });
    setShowForm(false);
  }

  async function toggleStatus(c: any) {
    const newStatus = c.status === 'active' ? 'expired' : 'active';
    await getSupabase().from('ad_contracts').update({ status: newStatus }).eq('id', c.id);
    setContracts(contracts.map(x => x.id === c.id ? { ...x, status: newStatus } : x));
    logAction(admin?.full_name || '', `Contrat ${newStatus}`, 'contract', c.id, c.client_name);
  }

  async function deleteContract(c: any) {
    if (!confirm('Supprimer ce contrat ?')) return;
    await getSupabase().from('ad_contracts').delete().eq('id', c.id);
    setContracts(contracts.filter(x => x.id !== c.id));
  }

  const totalRevenue = contracts.filter(c => c.status === 'active').reduce((s, c) => s + Number(c.amount), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Contrats Publicite ({contracts.length})</h1>
          <p className="text-xs text-slate-500">Revenu actif: {formatPrice(totalRevenue)}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" />Nouveau</Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold">Nouveau contrat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nom du client *" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <select value={form.pack} onChange={e => setForm({ ...form, pack: e.target.value })} className="px-3 py-2 rounded-lg border text-xs">
              {PACKS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" placeholder="Montant (XOF)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg border text-xs">
              <option value="active">Actif</option><option value="expired">Expire</option>
            </select>
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSave}>Creer</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Client</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Pack</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Montant</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Periode</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Statut</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-900">{c.client_name}</td>
                <td className="px-4 py-2.5 text-xs text-slate-600">{c.pack}</td>
                <td className="px-4 py-2.5 text-xs font-medium text-orange-600">{formatPrice(Number(c.amount))}</td>
                <td className="px-4 py-2.5 text-[10px] text-slate-500">{c.start_date} → {c.end_date}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleStatus(c)}>
                    {c.status === 'active' ? <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Actif</span> : <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Expire</span>}
                  </button>
                </td>
                <td className="px-4 py-2.5"><button onClick={() => deleteContract(c)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Aucun contrat</p>}
      </Card>
    </div>
  );
}
