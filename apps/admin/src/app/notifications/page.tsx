'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Send, Loader2, Trash2, Plus } from 'lucide-react';
import { Card, Badge, Button, Input } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { logAction } from '@/lib/admin-log';
import { useAdminAuth } from '@/lib/auth-context';

export default function NotificationsPage() {
  const { user: admin } = useAdminAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: '', title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      getSupabase().from('notifications').select('*, users(full_name, email)').order('created_at', { ascending: false }).limit(50),
      getSupabase().from('users').select('id, full_name, email, role').in('role', ['announcer', 'user']),
    ]).then(([{ data: notifs }, { data: usrs }]) => {
      setNotifications(notifs || []);
      setUsers(usrs || []);
      setLoading(false);
    });
  }, []);

  async function sendNotification() {
    setSending(true);
    const supabase = getSupabase();

    if (form.user_id === 'all') {
      const inserts = users.map(u => ({ user_id: u.id, title: form.title, message: form.message }));
      await supabase.from('notifications').insert(inserts);
      logAction(admin?.full_name || '', `Notification a tous (${users.length})`, 'notification', '', form.title);
    } else {
      const { data } = await supabase.from('notifications').insert({ user_id: form.user_id, title: form.title, message: form.message }).select('*, users(full_name, email)').single();
      if (data) setNotifications([data, ...notifications]);
      logAction(admin?.full_name || '', 'Notification envoyee', 'notification', form.user_id, form.title);
    }

    setForm({ user_id: '', title: '', message: '' });
    setShowForm(false);
    setSending(false);
  }

  async function deleteNotif(id: string) {
    await getSupabase().from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Notifications ({notifications.length})</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" />Envoyer</Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold">Nouvelle notification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} className="px-3 py-2 rounded-lg border text-xs">
              <option value="">Selectionnez un destinataire</option>
              <option value="all">Tous les utilisateurs ({users.length})</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
            </select>
            <input placeholder="Titre *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={sendNotification} disabled={!form.user_id || !form.title || !form.message || sending}>
              {sending ? <Loader2 size={13} className="animate-spin mr-1" /> : <Send size={13} className="mr-1" />}{sending ? 'Envoi...' : 'Envoyer'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.map(n => (
          <Card key={n.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={14} className={n.read ? 'text-slate-300' : 'text-orange-500'} />
              <div>
                <div className="text-xs font-medium text-slate-900">{n.title}</div>
                <div className="text-[10px] text-slate-500">{n.message}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  A: {n.users?.full_name || 'Utilisateur'} | {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {n.read && ' | Lu'}
                </div>
              </div>
            </div>
            <button onClick={() => deleteNotif(n.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-400" /></button>
          </Card>
        ))}
        {notifications.length === 0 && <Card className="p-8 text-center text-xs text-slate-400">Aucune notification envoyee</Card>}
      </div>
    </div>
  );
}
