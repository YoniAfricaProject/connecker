'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Bell, RefreshCw } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type Notif = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setNotifs((data as any) || []);
    } catch (e: any) {
      setError(e.message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    try {
      const supabase = getSupabase();
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch {}
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
            </p>
          )}
        </div>
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
      ) : notifs.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell size={22} className="text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Aucune notification</h2>
          <p className="text-sm text-slate-500 mt-1">Vous serez notifié des nouvelles importantes ici.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => !n.read && markRead(n.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  n.read ? 'border-slate-100 bg-white' : 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                }`}
              >
                <div className="flex gap-3">
                  <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-slate-200' : 'bg-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{n.title}</div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(n.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
