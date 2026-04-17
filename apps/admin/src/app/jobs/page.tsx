'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { logAction } from '@/lib/admin-log';
import { useAdminAuth } from '@/lib/auth-context';

export default function JobsPage() {
  const { user: admin } = useAdminAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', company: '', city: '', district: '', type: 'CDI', experience: '', salary: '', description: '', tags: '' });

  useEffect(() => { getSupabase().from('jobs').select('*').order('created_at', { ascending: false }).then(({ data }) => { setJobs(data || []); setLoading(false); }); }, []);

  async function handleSave() {
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const supabase = getSupabase();
    if (editId) {
      await supabase.from('jobs').update(payload).eq('id', editId);
      setJobs(jobs.map(j => j.id === editId ? { ...j, ...payload } : j));
      logAction(admin?.full_name || '', 'Modification offre', 'job', editId, form.title);
    } else {
      const { data } = await supabase.from('jobs').insert(payload).select().single();
      if (data) setJobs([data, ...jobs]);
      logAction(admin?.full_name || '', 'Ajout offre', 'job', data?.id, form.title);
    }
    setForm({ title: '', company: '', city: '', district: '', type: 'CDI', experience: '', salary: '', description: '', tags: '' });
    setShowForm(false); setEditId(null);
  }

  async function deleteJob(j: any) {
    if (!confirm(`Supprimer "${j.title}" ?`)) return;
    await getSupabase().from('jobs').delete().eq('id', j.id);
    setJobs(jobs.filter(x => x.id !== j.id));
    logAction(admin?.full_name || '', 'Suppression offre', 'job', j.id, j.title);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Offres d&apos;emploi ({jobs.length})</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', company: '', city: '', district: '', type: 'CDI', experience: '', salary: '', description: '', tags: '' }); }}>
          <Plus size={14} className="mr-1" />Ajouter
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold">{editId ? 'Modifier' : 'Nouvelle'} offre</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Titre du poste *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Entreprise *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Ville *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg border text-xs">
              <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Freelance">Freelance</option><option value="Stage">Stage</option>
            </select>
            <input placeholder="Experience (ex: 2 a 3 ans)" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Salaire" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs" />
          <input placeholder="Tags (separes par virgule)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-xs" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSave}>{editId ? 'Modifier' : 'Publier'}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {jobs.map(j => (
          <Card key={j.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-900">{j.title}</div>
              <div className="text-[10px] text-slate-500">{j.company} - {j.city} - <Badge>{j.type}</Badge></div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditId(j.id); setForm({ ...j, tags: (j.tags || []).join(', ') }); setShowForm(true); }} className="p-1.5 rounded hover:bg-slate-100"><Edit size={13} className="text-slate-400" /></button>
              <button onClick={() => deleteJob(j)} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-400" /></button>
            </div>
          </Card>
        ))}
        {jobs.length === 0 && <Card className="p-8 text-center text-xs text-slate-400">Aucune offre</Card>}
      </div>
    </div>
  );
}
