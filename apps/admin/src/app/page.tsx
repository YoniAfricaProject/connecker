'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, MessageSquare, AlertCircle, ArrowUpRight, Loader2, TrendingUp, Clock, Globe, Smartphone, Zap, DollarSign, Megaphone, Percent, CreditCard } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <p className="text-slate-400 mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-medium">{p.value} {p.name || 'visites'}</p>
      ))}
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs space-y-1">
      <p className="text-slate-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill || p.stroke }} />
          {p.dataKey}: <span className="font-bold">{formatPrice(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [stats, setStats] = useState({ properties: 0, pending: 0, users: 0, leads: 0, totalViews: 0 });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<{ hourly: any[]; daily: any[]; pages: any[]; devices: any[]; todayViews: number; weekViews: number }>({
    hourly: [], daily: [], pages: [], devices: [], todayViews: 0, weekViews: 0,
  });
  const [revenue, setRevenue] = useState<{ total: number; byType: any[]; monthly: any[]; recent: any[] }>({
    total: 0, byType: [], monthly: [], recent: [],
  });
  const [adminCharts, setAdminCharts] = useState<{ statusBreakdown: any[]; leadsDaily: any[]; topAnnouncers: any[]; conversionRate: number }>({
    statusBreakdown: [], leadsDaily: [], topAnnouncers: [], conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const [
        { count: properties }, { count: pending }, { count: users }, { count: leads },
        { data: recentProps }, { data: recentLds },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*, users!announcer_id(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('*, properties(title)').order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({ properties: properties || 0, pending: pending || 0, users: users || 0, leads: leads || 0, totalViews: 0 });
      setRecentProperties(recentProps || []);
      setRecentLeads(recentLds || []);

      // Admin charts (visible to all admins)
      const [{ data: allProps }, { data: allLeads }] = await Promise.all([
        supabase.from('properties').select('status, views_count, leads_count, announcer_id, users!announcer_id(full_name)'),
        supabase.from('leads').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      if (allProps) {
        // Status breakdown
        const statusMap: Record<string, number> = { published: 0, pending: 0, rejected: 0, draft: 0, expired: 0 };
        allProps.forEach((p: any) => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
        const statusLabels: Record<string, string> = { published: 'Publiees', pending: 'En attente', rejected: 'Rejetees', draft: 'Brouillons', expired: 'Expirees' };
        const statusBreakdown = Object.entries(statusMap).filter(([, v]) => v > 0).map(([status, count]) => ({ name: statusLabels[status] || status, value: count }));

        // Top announcers
        const annMap: Record<string, { name: string; count: number }> = {};
        allProps.forEach((p: any) => {
          const name = (p.users as any)?.full_name || 'Inconnu';
          if (!annMap[p.announcer_id]) annMap[p.announcer_id] = { name, count: 0 };
          annMap[p.announcer_id].count++;
        });
        const topAnnouncers = Object.values(annMap).sort((a, b) => b.count - a.count).slice(0, 5);

        // Conversion rate
        const totalViews = allProps.reduce((s: number, p: any) => s + (p.views_count || 0), 0);
        const totalLeadsCount = allProps.reduce((s: number, p: any) => s + (p.leads_count || 0), 0);
        const conversionRate = totalViews > 0 ? (totalLeadsCount / totalViews) * 100 : 0;

        // Leads daily (7 days)
        const dailyLeadsMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          dailyLeadsMap[d.toLocaleDateString('fr-FR', { weekday: 'short' })] = 0;
        }
        (allLeads || []).forEach((l: any) => {
          const k = new Date(l.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
          if (dailyLeadsMap[k] !== undefined) dailyLeadsMap[k]++;
        });

        setAdminCharts({
          statusBreakdown,
          leadsDaily: Object.entries(dailyLeadsMap).map(([jour, leads]) => ({ jour, leads })),
          topAnnouncers,
          conversionRate,
        });
      }

      if (isSuperAdmin) {
        const { data: views, count: totalViews } = await supabase
          .from('page_views').select('path, user_agent, created_at', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (views) {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

          const hourlyMap: Record<string, number> = {};
          for (let i = 23; i >= 0; i--) { const h = new Date(now.getTime() - i * 3600000); hourlyMap[`${String(h.getHours()).padStart(2, '0')}h`] = 0; }
          views.filter(v => new Date(v.created_at) > new Date(Date.now() - 86400000)).forEach(v => { const h = `${String(new Date(v.created_at).getHours()).padStart(2, '0')}h`; if (hourlyMap[h] !== undefined) hourlyMap[h]++; });

          const dailyMap: Record<string, number> = {};
          for (let i = 29; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); dailyMap[`${d.getDate()}/${d.getMonth() + 1}`] = 0; }
          views.forEach(v => { const d = new Date(v.created_at); const k = `${d.getDate()}/${d.getMonth() + 1}`; if (dailyMap[k] !== undefined) dailyMap[k]++; });

          const pagesMap: Record<string, number> = {};
          views.forEach(v => { pagesMap[v.path] = (pagesMap[v.path] || 0) + 1; });

          const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
          views.forEach(v => { const ua = (v.user_agent || '').toLowerCase(); if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) deviceMap.Mobile++; else if (ua.includes('ipad') || ua.includes('tablet')) deviceMap.Tablet++; else deviceMap.Desktop++; });

          setTraffic({
            hourly: Object.entries(hourlyMap).map(([hour, vues]) => ({ hour, vues })),
            daily: Object.entries(dailyMap).map(([jour, vues]) => ({ jour, vues })),
            pages: Object.entries(pagesMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([page, vues]) => ({ page: page.length > 25 ? page.slice(0, 25) + '...' : page, vues })),
            devices: Object.entries(deviceMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),
            todayViews: views.filter(v => v.created_at >= todayStart).length,
            weekViews: views.filter(v => v.created_at >= weekStart).length,
          });
          setStats(s => ({ ...s, totalViews: totalViews || 0 }));
        }

        const { data: revData } = await supabase.from('revenues').select('*').order('created_at', { ascending: true });
        if (revData) {
          const total = revData.reduce((s, r) => s + Number(r.amount), 0);
          const typeMap: Record<string, number> = { advertising: 0, commission: 0, subscription: 0 };
          revData.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + Number(r.amount); });
          const byType = [
            { name: 'Commissions', value: typeMap.commission },
            { name: 'Publicite', value: typeMap.advertising },
            { name: 'Abonnements', value: typeMap.subscription },
          ];
          const monthlyMap: Record<string, { pub: number; com: number; abo: number }> = {};
          for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); monthlyMap[d.toLocaleDateString('fr-FR', { month: 'short' })] = { pub: 0, com: 0, abo: 0 }; }
          revData.forEach(r => { const k = new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'short' }); if (monthlyMap[k]) { if (r.type === 'advertising') monthlyMap[k].pub += Number(r.amount); else if (r.type === 'commission') monthlyMap[k].com += Number(r.amount); else monthlyMap[k].abo += Number(r.amount); } });

          setRevenue({
            total, byType,
            monthly: Object.entries(monthlyMap).map(([mois, v]) => ({ mois, Commissions: v.com, Publicite: v.pub, Abonnements: v.abo })),
            recent: [...revData].reverse().slice(0, 5),
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [isSuperAdmin]);

  if (loading) return <div className="flex flex-col items-center justify-center py-32 gap-2"><Loader2 size={24} className="animate-spin text-orange-500" /><span className="text-xs text-slate-400">Chargement...</span></div>;

  const REVENUE_COLORS = ['#f97316', '#64748b', '#cbd5e1'];
  const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
    advertising: { icon: Megaphone, color: 'text-orange-500 bg-orange-50' },
    commission: { icon: Percent, color: 'text-slate-600 bg-slate-100' },
    subscription: { icon: CreditCard, color: 'text-slate-400 bg-slate-50' },
  };

  return (
    <div className="space-y-6 text-[13px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          {isSuperAdmin && <p className="text-xs text-orange-500 flex items-center gap-1 mt-0.5"><Zap size={11} /> Super Admin</p>}
        </div>
        <span className="text-xs text-slate-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Annonces', value: stats.properties, icon: Building2, accent: 'border-l-orange-500' },
          { label: 'En attente', value: stats.pending, icon: AlertCircle, accent: 'border-l-amber-400' },
          { label: 'Utilisateurs', value: stats.users, icon: Users, accent: 'border-l-slate-400' },
          { label: 'Leads', value: stats.leads, icon: MessageSquare, accent: 'border-l-slate-300' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`p-4 border-l-[3px] ${accent}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
              <Icon size={16} className="text-slate-300" />
            </div>
          </Card>
        ))}
      </div>

      {/* Admin charts - visible to all admins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Annonces par statut</h2>
          {adminCharts.statusBreakdown.length > 0 ? (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={adminCharts.statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#fff">
                      {adminCharts.statusBreakdown.map((_, i) => <Cell key={i} fill={['#f97316', '#f59e0b', '#94a3b8', '#cbd5e1', '#e2e8f0'][i % 5]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {adminCharts.statusBreakdown.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#f97316', '#f59e0b', '#94a3b8', '#cbd5e1', '#e2e8f0'][i % 5] }} />
                      <span className="text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-xs text-slate-400 text-center py-8">Aucune donnee</p>}
        </Card>

        {/* Leads 7 days */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Leads - 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={adminCharts.leadsDaily} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="leads" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top announcers + conversion */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Top annonceurs</h2>
          <div className="space-y-2 mb-5">
            {adminCharts.topAnnouncers.map((a, i) => {
              const maxCount = adminCharts.topAnnouncers[0]?.count || 1;
              const pct = Math.round((a.count / maxCount) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 truncate max-w-[140px]">{a.name}</span>
                    <span className="font-bold text-slate-900">{a.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%`, opacity: 1 - (i * 0.15) }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Taux de conversion</h2>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-orange-600">{adminCharts.conversionRate.toFixed(1)}%</span>
              <span className="text-xs text-slate-500 mb-1">leads / vues</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(adminCharts.conversionRate * 5, 100)}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {isSuperAdmin && (
        <>
          {/* Revenue summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <DollarSign size={14} className="mb-1 opacity-70" />
              <div className="text-xl font-bold">{formatPrice(revenue.total)}</div>
              <div className="text-xs text-white/60">Revenus totaux</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0">
              <Percent size={14} className="mb-1 opacity-70" />
              <div className="text-xl font-bold">{formatPrice(revenue.byType.find(t => t.name === 'Commissions')?.value || 0)}</div>
              <div className="text-xs text-white/60">Commissions</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0">
              <CreditCard size={14} className="mb-1 opacity-70" />
              <div className="text-xl font-bold">{formatPrice((revenue.byType.find(t => t.name === 'Publicite')?.value || 0) + (revenue.byType.find(t => t.name === 'Abonnements')?.value || 0))}</div>
              <div className="text-xs text-white/60">Pub & Abo</div>
            </Card>
          </div>

          {/* Revenue charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Card className="p-5 lg:col-span-3">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Revenus mensuels</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue.monthly} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="Commissions" stackId="r" fill="#f97316" />
                  <Bar dataKey="Publicite" stackId="r" fill="#94a3b8" />
                  <Bar dataKey="Abonnements" stackId="r" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Repartition</h2>
              <div className="flex justify-center">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={revenue.byType} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#fff">
                      {revenue.byType.map((_, i) => <Cell key={i} fill={REVENUE_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {revenue.byType.map((t, i) => {
                  const pct = revenue.total > 0 ? Math.round((t.value / revenue.total) * 100) : 0;
                  return (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REVENUE_COLORS[i] }} />
                        <span className="text-xs text-slate-600">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: REVENUE_COLORS[i] }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                {revenue.recent.map((r: any) => {
                  const t = TYPE_ICONS[r.type] || TYPE_ICONS.commission;
                  const Icon = t.icon;
                  return (
                    <div key={r.id} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded ${t.color} flex items-center justify-center flex-shrink-0`}><Icon size={10} /></div>
                      <span className="text-xs text-slate-500 truncate flex-1">{r.description}</span>
                      <span className="text-xs font-bold text-orange-600">+{formatPrice(Number(r.amount))}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Traffic */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Aujourd'hui", value: traffic.todayViews, accent: 'border-l-orange-500' },
              { label: 'Cette semaine', value: traffic.weekViews, accent: 'border-l-amber-400' },
              { label: '30 jours', value: stats.totalViews, accent: 'border-l-slate-400' },
            ].map(({ label, value, accent }) => (
              <Card key={label} className={`p-3 border-l-[3px] ${accent}`}>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Trafic - 30 jours</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={traffic.daily}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="jour" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="vues" stroke="#f97316" strokeWidth={1.5} fill="url(#tg)" dot={false} activeDot={{ r: 3, fill: '#f97316', stroke: '#fff', strokeWidth: 1.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Heures de pointe</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={traffic.hourly} barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="vues" radius={[3, 3, 0, 0]}>
                    {traffic.hourly.map((e, i) => <Cell key={i} fill={e.vues > 0 ? '#f97316' : '#f1f5f9'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Appareils</h2>
              {traffic.devices.some(d => d.value > 0) ? (
                <div className="space-y-3">
                  {traffic.devices.map((d) => {
                    const total = traffic.devices.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={d.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600">{d.name}</span>
                          <span className="font-bold text-slate-900">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-slate-400 text-center py-4">En attente</p>}

              <h2 className="text-sm font-semibold text-slate-900 mt-5 mb-2 pt-3 border-t border-slate-100">Top pages</h2>
              <div className="space-y-1.5">
                {traffic.pages.map((p) => (
                  <div key={p.page} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono truncate max-w-[120px]">{p.page}</span>
                    <span className="font-bold text-slate-800">{p.vues}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Dernieres annonces</h2>
            <Link href="/properties" className="text-xs text-orange-600 flex items-center gap-0.5">Voir <ArrowUpRight size={10} /></Link>
          </div>
          <div className="space-y-0.5">
            {recentProperties.map((p: any) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.users?.full_name}</div>
                </div>
                <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                  {p.status === 'published' ? 'Active' : p.status === 'pending' ? 'En attente' : p.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Derniers leads</h2>
            <Link href="/leads" className="text-xs text-orange-600 flex items-center gap-0.5">Voir <ArrowUpRight size={10} /></Link>
          </div>
          <div className="space-y-0.5">
            {recentLeads.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {l.sender_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{l.sender_name}</div>
                    <div className="text-xs text-slate-400 truncate">{l.properties?.title}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
