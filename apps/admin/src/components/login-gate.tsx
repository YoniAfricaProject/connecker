'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input, Logo } from '@connecker/ui';
import { useAdminAuth } from '@/lib/auth-context';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSubmitting(true);
      const result = await signIn(email, password);
      if (result.error) {
        setError('Identifiants invalides ou acces non autorise');
      }
      setSubmitting(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Logo light className="justify-center mb-4" />
            <div className="flex items-center justify-center gap-2 text-orange-400">
              <Shield size={16} />
              <span className="text-sm font-medium">Administration</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@connecker.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <Button variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {submitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
