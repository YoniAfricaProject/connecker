'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, MessageSquare, AlertCircle, ArrowUpRight, Loader2, TrendingUp, Clock, Globe, Smartphone, Eye, Zap, DollarSign, Megaphone, Percent, CreditCard } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const CHART_COLORS = ['#f97316', '#6366f1', '#10b981', '#f43f5e', '#eab308', '#06b6d4'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold">{p.value} {p.dataKey === 'vues' ? 'visites' : p.dataKey}</p>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, change }: { label: string; value: number; icon: any; gradient: string; change?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon size={20} />
          </div>
          {change && (
            <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">{change}</span>
          )}
        </div>
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString('fr-FR')}</div>
        <div className="text-sm text-white/70 mt-1">{label}</div>
      </div>
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
        const { data: views, count: totalViews } = await supabase
          .from('page_views')
          .select('path, user_agent, created_at', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (views) {
          const now = new Date();

          // Today / This week counts
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const todayViews = views.filter(v => v.created_at >= todayStart).length;
          const weekViews = views.filter(v => v.created_at >= weekStart).length;

          // Hourly (last 24h)
          const hourlyMap: Record<string, number> = {};
          for (let i = 23; i >= 0; i--) {
            const h = new Date(now.getTime() - i * 60 * 60 * 1000);
            hourlyMap[`${String(h.getHours()).padStart(2, '0')}h`] = 0;
          }
          views.filter(v => new Date(v.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).forEach(v => {
            const h = `${String(new Date(v.created_at).getHours()).padStart(2, '0')}h`;
            if (hourlyMap[h] !== undefined) hourlyMap[h]++;
          });

          // Daily (last 30 days)
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

          // Top pages
          const pagesMap: Record<string, number> = {};
          views.forEach(v => { pagesMap[v.path] = (pagesMap[v.path] || 0) + 1; });

          // Devices
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
            pages: Object.entries(pagesMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, vues]) => ({ page: page.length > 25 ? page.slice(0, 25) + '...' : page, vues })),
            devices: Object.entries(deviceMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),
            todayViews,
            weekViews,
          });

          setStats(s => ({ ...s, totalViews: totalViews || 0 }));
        }

        // Revenue data
        const { data: revData } = await supabase
          .from('revenues')
          .select('*')
          .order('created_at', { ascending: true });

        if (revData) {
          const total = revData.reduce((s, r) => s + Number(r.amount), 0);

          // By type
          const typeMap: Record<string, number> = { advertising: 0, commission: 0, subscription: 0 };
          revData.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + Number(r.amount); });
          const typeLabels: Record<string, string> = { advertising: 'Publicite', commission: 'Commissions', subscription: 'Abonnements' };
          const byType = Object.entries(typeMap).map(([type, amount]) => ({ name: typeLabels[type] || type, value: amount }));

          // Monthly revenue (last 6 months)
          const monthlyMap: Record<string, { pub: number; com: number; abo: number }> = {};
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString('fr-FR', { month: 'short' });
            monthlyMap[key] = { pub: 0, com: 0, abo: 0 };
          }
          revData.forEach(r => {
            const d = new Date(r.created_at);
            const key = d.toLocaleDateString('fr-FR', { month: 'short' });
            if (monthlyMap[key]) {
              if (r.type === 'advertising') monthlyMap[key].pub += Number(r.amount);
              else if (r.type === 'commission') monthlyMap[key].com += Number(r.amount);
              else monthlyMap[key].abo += Number(r.amount);
            }
          });
          const monthly = Object.entries(monthlyMap).map(([mois, v]) => ({ mois, Publicite: v.pub, Commissions: v.com, Abonnements: v.abo }));

          // Recent transactions
          const recent = [...revData].reverse().slice(0, 6);

          setRevenue({ total, byType, monthly, recent });
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
        <span className="text-sm text-slate-400">Chargement du dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {isSuperAdmin ? (
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" /> Super Admin - Analytics complets
              </span>
            ) : 'Vue d\'ensemble'}
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Annonces" value={stats.properties} icon={Building2} gradient="bg-gradient-to-br from-orange-500 to-orange-600" />
        <StatCard label="En attente" value={stats.pending} icon={AlertCircle} gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard label="Utilisateurs" value={stats.users} icon={Users} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard label="Leads" value={stats.leads} icon={MessageSquare} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      </div>

      {/* Super Admin Analytics */}
      {isSuperAdmin && (
        <>
          {/* Revenue Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-green-500 to-emerald-600">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={18} />
                  <span className="text-sm font-medium text-white/80">Revenus totaux</span>
                </div>
                <div className="text-3xl font-bold tracking-tight">{formatPrice(revenue.total)}</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-violet-500 to-purple-600">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Percent size={18} />
                  <span className="text-sm font-medium text-white/80">Commissions</span>
                </div>
                <div className="text-3xl font-bold tracking-tight">{formatPrice(revenue.byType.find(t => t.name === 'Commissions')?.value || 0)}</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-sky-500 to-blue-600">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={18} />
                  <span className="text-sm font-medium text-white/80">Pub + Abonnements</span>
                </div>
                <div className="text-3xl font-bold tracking-tight">{formatPrice((revenue.byType.find(t => t.name === 'Publicite')?.value || 0) + (revenue.byType.find(t => t.name === 'Abonnements')?.value || 0))}</div>
              </div>
            </div>
          </div>

          {/* Revenue charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Monthly revenue stacked */}
            <Card className="p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Revenus mensuels</h2>
                  <p className="text-sm text-slate-500">Repartition par source</p>
                </div>
                <TrendingUp size={18} className="text-slate-300" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue.monthly} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <p className="text-slate-400 font-medium">{label}</p>
                        {payload.map((p: any, i: number) => (
                          <p key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                            {p.dataKey}: <span className="font-bold">{formatPrice(p.value)}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }} />
                  <Bar dataKey="Publicite" stackId="rev" fill="#f97316" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Commissions" stackId="rev" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Abonnements" stackId="rev" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue by type donut + recent */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Par source</h2>
                  <p className="text-sm text-slate-500">Repartition des revenus</p>
                </div>
              </div>
              <div className="flex justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={revenue.byType} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={3} stroke="#fff">
                      {revenue.byType.map((_, i) => <Cell key={i} fill={['#f97316', '#8b5cf6', '#06b6d4'][i % 3]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {revenue.byType.map((t, i) => {
                  const pct = revenue.total > 0 ? Math.round((t.value / revenue.total) * 100) : 0;
                  const colors = ['#f97316', '#8b5cf6', '#06b6d4'];
                  return (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                        <span className="text-sm text-slate-700">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent transactions */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Dernieres transactions</h3>
                <div className="space-y-2">
                  {revenue.recent.map((r: any) => {
                    const typeIcon: Record<string, { icon: any; color: string }> = {
                      advertising: { icon: Megaphone, color: 'text-orange-500 bg-orange-50' },
                      commission: { icon: Percent, color: 'text-purple-500 bg-purple-50' },
                      subscription: { icon: CreditCard, color: 'text-sky-500 bg-sky-50' },
                    };
                    const t = typeIcon[r.type] || typeIcon.commission;
                    const Icon = t.icon;
                    return (
                      <div key={r.id} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg ${t.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-700 truncate">{r.description}</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 flex-shrink-0">+{formatPrice(Number(r.amount))}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick traffic stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-orange-500">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aujourd&apos;hui</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{traffic.todayViews}</div>
              <div className="text-xs text-slate-400">visites</div>
            </Card>
            <Card className="p-5 border-l-4 border-l-indigo-500">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cette semaine</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{traffic.weekViews}</div>
              <div className="text-xs text-slate-400">visites</div>
            </Card>
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">30 derniers jours</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalViews}</div>
              <div className="text-xs text-slate-400">visites</div>
            </Card>
          </div>

          {/* Main traffic chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Trafic</h2>
                <p className="text-sm text-slate-500">Visites sur les 30 derniers jours</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
                <span className="text-slate-500">Visites</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={traffic.daily}>
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="vues" stroke="#f97316" strokeWidth={2.5} fill="url(#gradientArea)" dot={false} activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Hourly - 3 cols */}
            <Card className="p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Heures de pointe</h2>
                  <p className="text-sm text-slate-500">Distribution du trafic sur 24h</p>
                </div>
                <Clock size={18} className="text-slate-300" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={traffic.hourly} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="vues" radius={[6, 6, 0, 0]}>
                    {traffic.hourly.map((entry, i) => (
                      <Cell key={i} fill={entry.vues > 0 ? '#6366f1' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Devices - 2 cols */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Appareils</h2>
                  <p className="text-sm text-slate-500">Repartition des visites</p>
                </div>
                <Smartphone size={18} className="text-slate-300" />
              </div>
              {traffic.devices.length > 0 && traffic.devices.some(d => d.value > 0) ? (
                <>
                  <div className="flex justify-center">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={traffic.devices}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={85}
                          dataKey="value"
                          strokeWidth={3}
                          stroke="#fff"
                        >
                          {traffic.devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {traffic.devices.map((d, i) => {
                      const total = traffic.devices.reduce((a, b) => a + b.value, 0);
                      const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                      return (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                            <span className="text-sm text-slate-700">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i] }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <Smartphone size={40} />
                  <p className="text-sm mt-3 text-slate-400">En attente de donnees</p>
                </div>
              )}
            </Card>
          </div>

          {/* Top pages */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pages les plus visitees</h2>
                <p className="text-sm text-slate-500">Top 8 des pages sur 30 jours</p>
              </div>
              <Globe size={18} className="text-slate-300" />
            </div>
            {traffic.pages.length > 0 ? (
              <div className="space-y-3">
                {traffic.pages.map((p, i) => {
                  const maxVal = traffic.pages[0]?.vues || 1;
                  const pct = Math.round((p.vues / maxVal) * 100);
                  return (
                    <div key={p.page} className="flex items-center gap-4">
                      <span className="w-6 text-xs font-bold text-slate-300 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-700 font-medium font-mono">{p.page}</span>
                          <span className="text-sm font-bold text-slate-900">{p.vues}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Globe size={40} />
                <p className="text-sm mt-3 text-slate-400">Naviguez sur le site pour generer des donnees</p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Dernieres annonces</h2>
            <Link href="/properties" className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
              Tout voir <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentProperties.map((p: any) => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 text-sm truncate group-hover:text-orange-600 transition-colors">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.users?.full_name} - {p.city}</div>
                </div>
                <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                  {p.status === 'published' ? 'Active' : p.status === 'pending' ? 'En attente' : p.status}
                </Badge>
              </Link>
            ))}
            {recentProperties.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Aucune annonce</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Derniers leads</h2>
            <Link href="/leads" className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
              Tout voir <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {l.sender_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{l.sender_name}</div>
                    <div className="text-xs text-slate-400 truncate">{l.properties?.title}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Aucun lead</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
