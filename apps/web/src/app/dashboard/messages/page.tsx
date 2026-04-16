'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type Lead = {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  created_at: string;
  read: boolean | null;
  properties?: { title: string; announcer_id: string } | null;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: err } = await supabase
        .from('leads')
        .select('*, properties(title, announcer_id)')
        .or(`sender_email.eq.${user.email},properties.announcer_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setLeads((data as any) || []);
    } catch (e: any) {
      setError(e.message || 'Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-orange-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={load} className="mt-3 text-sm font-medium text-red-700 hover:underline">Réessayer</button>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={22} className="text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Aucun message</h2>
          <p className="text-sm text-slate-500 mt-1">Vos conversations avec les annonceurs et acheteurs apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const initials = lead.sender_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            return (
              <li key={lead.id} className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-orange-200 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900 truncate">{lead.sender_name}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {lead.properties?.title && (
                      <div className="text-xs text-orange-600 font-medium truncate mb-1">Re : {lead.properties.title}</div>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{lead.message}</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                      <a href={`mailto:${lead.sender_email}`} className="hover:text-orange-600">{lead.sender_email}</a>
                      {lead.sender_phone && (
                        <a href={`tel:${lead.sender_phone}`} className="hover:text-orange-600">{lead.sender_phone}</a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
