'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, MessageSquare, AlertCircle, ArrowUpRight, Loader2, Eye, TrendingUp, Clock, Globe, Smartphone, Monitor } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/auth-context';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#eab308'];

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [stats, setStats] = useState({ properties: 0, pending: 0, users: 0, leads: 0 });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<{ hourly: any[]; daily: any[]; pages: any[]; devices: any[] }>({ hourly: [], daily: [], pages: [], devices: [] });
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

      setStats({ properties: properties || 0, pending: pending || 0, users: users || 0, leads: leads || 0 });
      setRecentProperties(recentProps || []);
      setRecentLeads(recentLds || []);

      // Load traffic data for super admin
      if (isSuperAdmin) {
        const { data: views } = await supabase
          .from('page_views')
          .select('path, user_agent, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (views) {
          // Hourly distribution (last 24h)
          const now = new Date();
          const hourlyMap: Record<string, number> = {};
          for (let i = 23; i >= 0; i--) {
            const h = new Date(now.getTime() - i * 60 * 60 * 1000);
            hourlyMap[`${h.getHours()}h`] = 0;
          }
          views.filter(v => new Date(v.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).forEach(v => {
            const h = `${new Date(v.created_at).getHours()}h`;
            if (hourlyMap[h] !== undefined) hourlyMap[h]++;
          });
          const hourly = Object.entries(hourlyMap).map(([hour, count]) => ({ hour, vues: count }));

          // Daily (last 30 days)
          const dailyMap: Record<string, number> = {};
          for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            dailyMap[key] = 0;
          }
          views.forEach(v => {
            const d = new Date(v.created_at);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            if (dailyMap[key] !== undefined) dailyMap[key]++;
          });
          const daily = Object.entries(dailyMap).map(([jour, vues]) => ({ jour, vues }));

          // Top pages
          const pagesMap: Record<string, number> = {};
          views.forEach(v => { pagesMap[v.path] = (pagesMap[v.path] || 0) + 1; });
          const pages = Object.entries(pagesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([page, vues]) => ({ page, vues }));

          // Devices
          const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
          views.forEach(v => {
            const ua = (v.user_agent || '').toLowerCase();
            if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) deviceMap.Mobile++;
            else if (ua.includes('ipad') || ua.includes('tablet')) deviceMap.Tablet++;
            else deviceMap.Desktop++;
          });
          const devices = Object.entries(deviceMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

          setTraffic({ hourly, daily, pages, devices });
        }
      }

      setLoading(false);
    }
    load();
  }, [isSuperAdmin]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-500" /></div>;
  }

  const STATS = [
    { label: 'Total annonces', value: stats.properties, icon: Building2, color: 'bg-orange-100 text-orange-600' },
    { label: 'En attente', value: stats.pending, icon: AlertCircle, color: 'bg-amber-100 text-amber-600' },
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Leads recus', value: stats.leads, icon: MessageSquare, color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {isSuperAdmin ? 'Vue complete - Super Admin' : 'Vue d\'ensemble de la plateforme'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Super Admin Analytics */}
      {isSuperAdmin && (
        <>
          {/* Traffic over 30 days */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-orange-500" />
              <h2 className="text-lg font-semibold text-slate-900">Trafic des 30 derniers jours</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={traffic.daily}>
                <defs>
                  <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="vues" stroke="#f97316" strokeWidth={2} fill="url(#colorVues)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly traffic */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Clock size={20} className="text-blue-500" />
                <h2 className="text-lg font-semibold text-slate-900">Trafic par heure (24h)</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={traffic.hourly}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="vues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Devices */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Smartphone size={20} className="text-purple-500" />
                <h2 className="text-lg font-semibold text-slate-900">Appareils</h2>
              </div>
              {traffic.devices.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={traffic.devices} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {traffic.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {traffic.devices.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-slate-600">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Pas encore de donnees</p>
              )}
            </Card>
          </div>

          {/* Top pages */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={20} className="text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-900">Pages les plus visitees</h2>
            </div>
            {traffic.pages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={traffic.pages} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="page" type="category" tick={{ fontSize: 11 }} width={150} />
                  <Tooltip />
                  <Bar dataKey="vues" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">Pas encore de donnees de trafic</p>
            )}
          </Card>
        </>
      )}

      {/* Recent data - visible to all admins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Dernieres annonces</h2>
            <Link href="/properties" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((p: any) => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.users?.full_name} - {p.city}</div>
                </div>
                <Badge variant={p.status === 'published' ? 'sale' : p.status === 'pending' ? 'new' : 'default'}>
                  {p.status === 'published' ? 'Active' : p.status === 'pending' ? 'En attente' : p.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Derniers leads</h2>
            <Link href="/leads" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{l.sender_name}</div>
                  <div className="text-xs text-slate-500">{l.properties?.title}</div>
                </div>
                <div className="text-xs text-slate-400">{new Date(l.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
