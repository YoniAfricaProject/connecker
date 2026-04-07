'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { Button, Input } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', company_name: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company_name: (user as any).company_name || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const supabase = getSupabase();
    await supabase.from('users').update({
      full_name: form.full_name,
      phone: form.phone || null,
      company_name: form.company_name || null,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon profil</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <Input label="Nom complet" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input value={user.email} disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">L&apos;email ne peut pas etre modifie</p>
          </div>
          <Input label="Telephone" type="tel" placeholder="+221 XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {user.role === 'announcer' && (
            <Input label="Nom de l'entreprise" placeholder="Ex: Mon Agence Immo" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          )}
          <div className="flex items-center gap-3">
            <Button variant="primary" size="lg" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle size={16} /> Profil mis a jour
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
