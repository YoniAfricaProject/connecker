import { Building2, Users, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';

const STATS = [
  { label: 'Total annonces', value: '2,487', icon: Building2, change: '+142 ce mois', color: 'bg-orange-100 text-orange-600' },
  { label: 'Utilisateurs', value: '8,934', icon: Users, change: '+456 ce mois', color: 'bg-blue-100 text-blue-600' },
  { label: 'Leads generes', value: '1,243', icon: MessageSquare, change: '+89 cette semaine', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Taux conversion', value: '12.4%', icon: TrendingUp, change: '+1.2%', color: 'bg-purple-100 text-purple-600' },
];

const PENDING = [
  { id: '1', title: 'Terrain 500m2 a Saly', announcer: 'Ibrahima Fall', date: '2026-04-07', type: 'land' },
  { id: '2', title: 'Villa standing Ngor', announcer: 'Agence Touba Immo', date: '2026-04-07', type: 'villa' },
  { id: '3', title: 'Appartement T4 Mermoz', announcer: 'Fatou Sarr', date: '2026-04-06', type: 'apartment' },
  { id: '4', title: 'Local commercial Plateau', announcer: 'SCI Dakar Invest', date: '2026-04-06', type: 'commercial' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, change, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending moderation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">En attente de moderation</h2>
            <Badge variant="new">{PENDING.length}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {PENDING.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div>
                <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">par {item.announcer} - {item.date}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  <CheckCircle size={14} />Approuver
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                  <AlertCircle size={14} />Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Activite recente</h2>
        <div className="space-y-4">
          {[
            { action: 'Nouvelle inscription', detail: 'Mamadou Ba (annonceur)', time: 'Il y a 12 min', icon: Users, color: 'text-blue-500' },
            { action: 'Annonce publiee', detail: 'Villa 4 chambres - Almadies', time: 'Il y a 45 min', icon: CheckCircle, color: 'text-emerald-500' },
            { action: 'Annonce en attente', detail: 'Terrain 300m2 - Thies', time: 'Il y a 1h', icon: Clock, color: 'text-amber-500' },
            { action: 'Lead recu', detail: 'Contact pour Appart T3 Plateau', time: 'Il y a 2h', icon: MessageSquare, color: 'text-purple-500' },
          ].map(({ action, detail, time, icon: Icon, color }, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{action}</div>
                <div className="text-xs text-slate-500">{detail}</div>
              </div>
              <span className="text-xs text-slate-400">{time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
