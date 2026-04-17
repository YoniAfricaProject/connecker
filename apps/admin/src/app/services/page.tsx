'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, Trash2, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { logAction } from '@/lib/admin-log';

const CATEGORIES = ['Decorateur', 'Expert immobilier', 'Banque', 'Geometre', 'Sous-traitant', 'Promoteur', 'Agence', 'Architecte', 'Construction', 'Notaire'];

export default function ServicesPage() {
  const { user: admin } = useAdminAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], phone: '', email: '', city: '', district: '', description: '' });

  useEffect(() => {
    getSupabase().from('services').select('*').order('created_at', { ascending: false }).then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  async function handleSave() {
    const supabase = getSupabase();
    if (editId) {
      await supabase.from('services').update(form).eq('id', editId);
      setServices(services.map(s => s.id === editId ? { ...s, ...form } : s));
      logAction(admin?.full_name || '', 'Modification service', 'service', editId, form.name);
    } else {
      const { data } = await supabase.from('services').insert(form).select().single();
      if (data) setServices([data, ...services]);
      logAction(admin?.full_name || '', 'Ajout service', 'service', data?.id, form.name);
    }
    setForm({ name: '', category: CATEGORIES[0], phone: '', email: '', city: '', district: '', description: '' });
    setShowForm(false);
    setEditId(null);
  }

  async function toggleVerified(s: any) {
    await getSupabase().from('services').update({ verified: !s.verified }).eq('id', s.id);
    setServices(services.map(x => x.id === s.id ? { ...x, verified: !s.verified } : x));
    logAction(admin?.full_name || '', s.verified ? 'Retrait verification' : 'Verification', 'service', s.id, s.name);
  }

  async function deleteService(s: any) {
    if (!confirm(`Supprimer ${s.name} ?`)) return;
    await getSupabase().from('services').delete().eq('id', s.id);
    setServices(services.filter(x => x.id !== s.id));
    logAction(admin?.full_name || '', 'Suppression service', 'service', s.id, s.name);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Annuaire Services ({services.length})</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', category: CATEGORIES[0], phone: '', email: '', city: '', district: '', description: '' }); }}>
          <Plus size={14} className="mr-1" />Ajouter
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold">{editId ? 'Modifier' : 'Nouveau'} service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nom *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg border text-xs">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Telephone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Quartier" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border text-xs" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSave}>{editId ? 'Modifier' : 'Ajouter'}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Nom</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Categorie</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Ville</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Verifie</th>
            <th className="text-left text-[10px] font-medium text-slate-500 uppercase px-4 py-2">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5"><div className="text-xs font-medium text-slate-900">{s.name}</div><div className="text-[10px] text-slate-400">{s.phone}</div></td>
                <td className="px-4 py-2.5 text-xs text-slate-600">{s.category}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{s.city || '-'}</td>
                <td className="px-4 py-2.5">{s.verified ? <span className="text-emerald-600 text-[10px]">Verifie</span> : <span className="text-slate-400 text-[10px]">Non</span>}</td>
                <td className="px-4 py-2.5 flex gap-1">
                  <button onClick={() => toggleVerified(s)} className="p-1 rounded hover:bg-slate-100">{s.verified ? <XCircle size={13} className="text-slate-400" /> : <CheckCircle size={13} className="text-emerald-500" />}</button>
                  <button onClick={() => { setEditId(s.id); setForm(s); setShowForm(true); }} className="p-1 rounded hover:bg-slate-100"><Edit size={13} className="text-slate-400" /></button>
                  <button onClick={() => deleteService(s)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-400" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Aucun service</p>}
      </Card>
    </div>
  );
}
