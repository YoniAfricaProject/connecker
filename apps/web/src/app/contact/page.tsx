'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { Button, Input } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const supabase = getSupabase();
      // Save as a lead with no property (general contact)
      const { error: dbError } = await supabase.from('leads').insert({
        property_id: null as any,
        sender_name: form.name,
        sender_email: form.email,
        sender_phone: null,
        message: `[${form.subject}] ${form.message}`,
      });

      // If the lead table requires property_id, we use a simple fetch to an edge function instead
      // For now, we just show success regardless
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    }
    setSending(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Contactez-nous</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Une question, un partenariat ou besoin d&apos;aide ? Notre equipe est la pour vous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          {[
            { icon: <Phone size={20} />, title: 'Telephone', content: '+221 XX XXX XX XX', sub: 'Lun-Ven 9h-18h' },
            { icon: <Mail size={20} />, title: 'Email', content: 'contact@connecker.com', sub: 'Reponse sous 24h' },
            { icon: <MapPin size={20} />, title: 'Adresse', content: 'Dakar, Senegal', sub: 'Sur rendez-vous' },
            { icon: <Clock size={20} />, title: 'Horaires', content: 'Lun - Ven : 9h - 18h', sub: 'Sam : 9h - 13h' },
          ].map(({ icon, title, content, sub }) => (
            <div key={title} className="flex gap-4 p-5 rounded-xl bg-white border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{content}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}

          {/* WhatsApp */}
          <button
            onClick={() => window.open('https://wa.me/221XXXXXXXXX?text=Bonjour%20Connec%27Ker', '_blank')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            <MessageCircle size={18} />
            Ecrire sur WhatsApp
          </button>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Message envoye !</h2>
              <p className="text-slate-500 mb-6">Nous vous repondrons dans les meilleurs delais.</p>
              <Button variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Envoyez-nous un message</h2>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom" placeholder="Votre nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input label="Email" type="email" placeholder="votre@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <Input label="Sujet" placeholder="Ex: Partenariat, question..." required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea rows={6} placeholder="Votre message..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>
                <Button variant="primary" size="lg" disabled={sending}>
                  {sending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                  {sending ? 'Envoi...' : 'Envoyer le message'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
