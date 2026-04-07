'use client';

import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, Clock, Loader2 } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('leads')
        .select('*, properties(title, city)')
        .order('created_at', { ascending: false });
      setLeads(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateLeadStatus(id: string, status: string) {
    const supabase = getSupabase();
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Leads / Demandes de contact</h1>
        <Badge>{leads.filter(l => l.status === 'new').length} nouveaux</Badge>
      </div>

      <div className="flex gap-2">
        {['all', 'new', 'read', 'contacted', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              filter === s ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}>
            {s === 'all' ? 'Tous' : s === 'new' ? 'Nouveaux' : s === 'read' ? 'Lus' : s === 'contacted' ? 'Contactes' : 'Fermes'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">Aucun lead</Card>
        ) : filtered.map(lead => (
          <Card key={lead.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {lead.sender_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{lead.sender_name}</span>
                    <Badge variant={lead.status === 'new' ? 'new' : lead.status === 'contacted' ? 'sale' : 'default'}>
                      {lead.status === 'new' ? 'Nouveau' : lead.status === 'read' ? 'Lu' : lead.status === 'contacted' ? 'Contacte' : 'Ferme'}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-500">Re: {lead.properties?.title} ({lead.properties?.city})</div>
                  <p className="text-sm text-slate-600 mt-2">{lead.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Mail size={12} />{lead.sender_email}</span>
                    {lead.sender_phone && <span className="flex items-center gap-1"><Phone size={12} />{lead.sender_phone}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(lead.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div>
                <select value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="new">Nouveau</option>
                  <option value="read">Lu</option>
                  <option value="contacted">Contacte</option>
                  <option value="closed">Ferme</option>
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
