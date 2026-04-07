'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, ArrowUpRight, Loader2 } from 'lucide-react';
import { Card, Badge } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ properties: 0, pending: 0, users: 0, leads: 0, newLeads: 0 });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      const [
        { count: properties },
        { count: pending },
        { count: users },
        { count: leads },
        { count: newLeads },
        { data: recentProps },
        { data: recentLds },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('properties').select('*, users!announcer_id(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('*, properties(title)').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        properties: properties || 0,
        pending: pending || 0,
        users: users || 0,
        leads: leads || 0,
        newLeads: newLeads || 0,
      });
      setRecentProperties(recentProps || []);
      setRecentLeads(recentLds || []);
      setLoading(false);
    }
    load();
  }, []);

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
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent properties */}
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
                  {p.status === 'published' ? 'Active' : p.status === 'pending' ? 'En attente' : p.status === 'rejected' ? 'Rejetee' : p.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent leads */}
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
