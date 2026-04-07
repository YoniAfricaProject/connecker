import { Building2, Eye, MessageSquare, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Card } from '@connecker/ui';

const STATS = [
  { label: 'Annonces actives', value: '12', icon: Building2, change: '+2 ce mois', color: 'bg-orange-100 text-orange-600' },
  { label: 'Vues totales', value: '3,240', icon: Eye, change: '+18%', color: 'bg-blue-100 text-blue-600' },
  { label: 'Demandes recues', value: '47', icon: MessageSquare, change: '+5 cette semaine', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Taux de contact', value: '14%', icon: TrendingUp, change: '+2.3%', color: 'bg-purple-100 text-purple-600' },
];

const RECENT_LEADS = [
  { id: '1', name: 'Amadou Diallo', property: 'Villa moderne avec piscine', date: '2026-04-07', status: 'new' as const },
  { id: '2', name: 'Fatou Ndiaye', property: 'Appartement T3 standing', date: '2026-04-06', status: 'read' as const },
  { id: '3', name: 'Moussa Sow', property: 'Terrain constructible Saly', date: '2026-04-05', status: 'contacted' as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue ! Voici un apercu de votre activite.</p>
        </div>
        <Link href="/properties/new">
          <Button variant="primary">
            <Plus size={16} className="mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, change, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent leads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Dernieres demandes</h2>
          <Link href="/leads" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
            Voir tout <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {RECENT_LEADS.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.property}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  lead.status === 'new' ? 'bg-orange-100 text-orange-700' :
                  lead.status === 'read' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {lead.status === 'new' ? 'Nouveau' : lead.status === 'read' ? 'Lu' : 'Contacte'}
                </span>
                <div className="text-xs text-slate-400 mt-1">{lead.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
