'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, MessageSquare, AlertCircle, ArrowUpRight, Loader2, TrendingUp, Clock, Globe, Smartphone, Zap, DollarSign, Megaphone, Percent, CreditCard } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold">{p.value} {p.name || 'visites'}</p>
      ))}
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs space-y-1.5">
      <p className="text-slate-400 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.stroke }} />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      const [
        { count: properties },
        { count: pending },
        { count: users },
        { count: leads },
        { data: recentProps },
        { data: recentLds },
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

      if (isSuperAdmin) {
        // Traffic
        const { data: views, count: totalViews } = await supabase
          .from('page_views')
          .select('path, user_agent, created_at', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (views) {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

          const hourlyMap: Record<string, number> = {};
          for (let i = 23; i >= 0; i--) {
            const h = new Date(now.getTime() - i * 60 * 60 * 1000);
            hourlyMap[`${String(h.getHours()).padStart(2, '0')}h`] = 0;
          }
          views.filter(v => new Date(v.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).forEach(v => {
            const h = `${String(new Date(v.created_at).getHours()).padStart(2, '0')}h`;
            if (hourlyMap[h] !== undefined) hourlyMap[h]++;
          });

          const dailyMap: Record<string, number> = {};
          for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            dailyMap[`${d.getDate()}/${d.getMonth() + 1}`] = 0;
          }
          views.forEach(v => {
            const d = new Date(v.created_at);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            if (dailyMap[key] !== undefined) dailyMap[key]++;
          });

          const pagesMap: Record<string, number> = {};
          views.forEach(v => { pagesMap[v.path] = (pagesMap[v.path] || 0) + 1; });

          const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
          views.forEach(v => {
            const ua = (v.user_agent || '').toLowerCase();
            if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) deviceMap.Mobile++;
            else if (ua.includes('ipad') || ua.includes('tablet')) deviceMap.Tablet++;
            else deviceMap.Desktop++;
          });

          setTraffic({
            hourly: Object.entries(hourlyMap).map(([hour, vues]) => ({ hour, vues })),
            daily: Object.entries(dailyMap).map(([jour, vues]) => ({ jour, vues })),
            pages: Object.entries(pagesMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, vues]) => ({ page: page.length > 30 ? page.slice(0, 30) + '...' : page, vues })),
            devices: Object.entries(deviceMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),
            todayViews: views.filter(v => v.created_at >= todayStart).length,
            weekViews: views.filter(v => v.created_at >= weekStart).length,
          });
          setStats(s => ({ ...s, totalViews: totalViews || 0 }));
        }

        // Revenue
        const { data: revData } = await supabase.from('revenues').select('*').order('created_at', { ascending: true });
        if (revData) {
          const total = revData.reduce((s, r) => s + Number(r.amount), 0);
          const typeMap: Record<string, number> = { advertising: 0, commission: 0, subscription: 0 };
          revData.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + Number(r.amount); });
          const typeLabels: Record<string, string> = { advertising: 'Publicite', commission: 'Commissions', subscription: 'Abonnements' };
          const byType = Object.entries(typeMap).map(([type, amount]) => ({ name: typeLabels[type] || type, value: amount }));

          const monthlyMap: Record<string, { pub: number; com: number; abo: number }> = {};
          for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            monthlyMap[d.toLocaleDateString('fr-FR', { month: 'short' })] = { pub: 0, com: 0, abo: 0 };
          }
          revData.forEach(r => {
            const key = new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'short' });
            if (monthlyMap[key]) {
              if (r.type === 'advertising') monthlyMap[key].pub += Number(r.amount);
              else if (r.type === 'commission') monthlyMap[key].com += Number(r.amount);
              else monthlyMap[key].abo += Number(r.amount);
            }
          });

          setRevenue({
            total,
            byType,
            monthly: Object.entries(monthlyMap).map(([mois, v]) => ({ mois, Publicite: v.pub, Commissions: v.com, Abonnements: v.abo })),
            recent: [...revData].reverse().slice(0, 6),
          });
        }
      }

      setLoading(false);
    }
    load();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <span className="text-sm text-slate-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isSuperAdmin && <span className="flex items-center gap-1.5"><Zap size={13} className="text-orange-500" /> Super Admin</span>}
          </p>
        </div>
        <span className="text-xs text-slate-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* Stats - muted palette */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Annonces', value: stats.properties, icon: Building2 },
          { label: 'En attente', value: stats.pending, icon: AlertCircle },
          { label: 'Utilisateurs', value: stats.users, icon: Users },
          { label: 'Leads', value: stats.leads, icon: MessageSquare },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Icon size={18} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      {/* Super Admin */}
      {isSuperAdmin && (
        <>
          {/* Revenue cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                <DollarSign size={13} /> Revenus totaux
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatPrice(revenue.total)}</div>
            </Card>
            <Card className="p-5 border-l-4 border-l-slate-400">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                <Percent size={13} /> Commissions
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatPrice(revenue.byType.find(t => t.name === 'Commissions')?.value || 0)}</div>
            </Card>
            <Card className="p-5 border-l-4 border-l-slate-300">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                <CreditCard size={13} /> Pub & Abonnements
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatPrice((revenue.byType.find(t => t.name === 'Publicite')?.value || 0) + (revenue.byType.find(t => t.name === 'Abonnements')?.value || 0))}</div>
            </Card>
          </div>

          {/* Revenue chart + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="p-6 lg:col-span-3">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Revenus mensuels</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenue.monthly} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="Commissions" stackId="rev" fill="#f97316" />
                  <Bar dataKey="Publicite" stackId="rev" fill="#fdba74" />
                  <Bar dataKey="Abonnements" stackId="rev" fill="#fed7aa" radius={[4, 4, 0, 0]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Repartition</h2>
              <div className="flex justify-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={revenue.byType} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={3} stroke="#fff">
                      {revenue.byType.map((_, i) => <Cell key={i} fill={['#f97316', '#94a3b8', '#cbd5e1'][i % 3]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 mt-3">
                {revenue.byType.map((t, i) => {
                  const pct = revenue.total > 0 ? Math.round((t.value / revenue.total) * 100) : 0;
                  return (
                    <div key={t.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#f97316', '#94a3b8', '#cbd5e1'][i] }} />
                        <span className="text-slate-600">{t.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                {revenue.recent.slice(0, 4).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[140px]">{r.description}</span>
                    <span className="font-semibold text-slate-900">+{formatPrice(Number(r.amount))}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Traffic */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Trafic</h2>
            <p className="text-xs text-slate-400 mb-6">30 derniers jours - {stats.totalViews} visites</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={traffic.daily}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="jour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="vues" stroke="#f97316" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hours */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Heures de pointe</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={traffic.hourly} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="vues" radius={[4, 4, 0, 0]}>
                    {traffic.hourly.map((e, i) => <Cell key={i} fill={e.vues > 0 ? '#f97316' : '#f1f5f9'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Devices + Pages */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Appareils</h2>
              {traffic.devices.some(d => d.value > 0) ? (
                <div className="space-y-3">
                  {traffic.devices.map((d) => {
                    const total = traffic.devices.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={d.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">{d.name}</span>
                          <span className="font-semibold text-slate-900">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%`, opacity: 0.6 + (pct / 200) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">En attente de donnees</p>
              )}

              <h2 className="text-sm font-semibold text-slate-900 mt-6 mb-3 pt-4 border-t border-slate-100">Top pages</h2>
              <div className="space-y-2">
                {traffic.pages.slice(0, 5).map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono truncate max-w-[140px]">{p.page}</span>
                    <span className="font-semibold text-slate-900">{p.vues}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Dernieres annonces</h2>
            <Link href="/properties" className="text-xs text-orange-600 flex items-center gap-1">Voir <ArrowUpRight size={11} /></Link>
          </div>
          <div className="space-y-1">
            {recentProperties.map((p: any) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.users?.full_name}</div>
                </div>
                <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                  {p.status === 'published' ? 'Active' : p.status === 'pending' ? 'En attente' : p.status}
                </Badge>
              </Link>
            ))}
            {recentProperties.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune annonce</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Derniers leads</h2>
            <Link href="/leads" className="text-xs text-orange-600 flex items-center gap-1">Voir <ArrowUpRight size={11} /></Link>
          </div>
          <div className="space-y-1">
            {recentLeads.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {l.sender_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{l.sender_name}</div>
                    <div className="text-xs text-slate-400 truncate">{l.properties?.title}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucun lead</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
