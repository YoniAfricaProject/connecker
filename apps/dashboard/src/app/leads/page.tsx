'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Clock, Check, ChevronDown } from 'lucide-react';
import { Card, Badge, Button } from '@connecker/ui';

const LEADS = [
  { id: '1', name: 'Amadou Diallo', email: 'amadou@email.com', phone: '+221 77 123 45 67', property: 'Villa moderne avec piscine', message: 'Bonjour, je suis interesse par cette villa. Est-il possible de planifier une visite ce week-end ?', status: 'new' as const, date: '2026-04-07T10:30:00' },
  { id: '2', name: 'Fatou Ndiaye', email: 'fatou@email.com', phone: '+221 78 234 56 78', property: 'Appartement T3 standing Plateau', message: 'Je recherche un appartement pour ma famille. Celui-ci m\'interesse beaucoup. Quel est le montant de la caution ?', status: 'read' as const, date: '2026-04-06T14:15:00' },
  { id: '3', name: 'Moussa Sow', email: 'moussa@email.com', phone: '+221 76 345 67 89', property: 'Terrain constructible Saly', message: 'Je souhaite construire une residence touristique. Ce terrain est-il viabilise ?', status: 'contacted' as const, date: '2026-04-05T09:00:00' },
  { id: '4', name: 'Aissatou Ba', email: 'aissatou@email.com', phone: '+221 77 456 78 90', property: 'Villa moderne avec piscine', message: 'Est-ce que le prix est negociable ? Je suis acheteur cash.', status: 'new' as const, date: '2026-04-07T08:45:00' },
];

export default function LeadsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filtered = filter === 'all' ? LEADS : LEADS.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Demandes de contact</h1>
        <Badge>{LEADS.filter(l => l.status === 'new').length} nouvelles</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'new', label: 'Nouvelles' },
          { value: 'read', label: 'Lues' },
          { value: 'contacted', label: 'Contactees' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === value ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leads list */}
      <div className="space-y-3">
        {filtered.map((lead) => (
          <Card key={lead.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{lead.name}</span>
                    <Badge variant={lead.status === 'new' ? 'new' : lead.status === 'read' ? 'rent' : 'sale'}>
                      {lead.status === 'new' ? 'Nouveau' : lead.status === 'read' ? 'Lu' : 'Contacte'}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-500">Re: {lead.property}</div>
                  <p className="text-sm text-slate-600 mt-2">{lead.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Mail size={12} />{lead.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12} />{lead.phone}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(lead.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Mail size={14} className="mr-1" />Repondre</Button>
                <Button variant="ghost" size="sm"><Phone size={14} /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
