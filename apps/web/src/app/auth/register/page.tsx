'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight, Building2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Logo } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'user',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await signUp(formData);
    if (result.error) {
      setError(result.error === 'User already registered'
        ? 'Un compte existe deja avec cet email'
        : result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Compte cree !</h1>
          <p className="text-slate-500">
            Verifiez votre email <strong>{formData.email}</strong> pour activer votre compte.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" size="lg">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
          alt="Immobilier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <Logo light className="mb-6" />
          <h2 className="text-3xl font-bold text-white">Rejoignez Connec&apos;Ker</h2>
          <p className="mt-3 text-slate-300">Creez votre compte et accedez a des milliers d&apos;annonces immobilieres.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo className="mb-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Creer un compte</h1>
            <p className="mt-2 text-slate-500">
              Deja inscrit ?{' '}
              <Link href="/auth/login" className="text-orange-600 font-medium hover:text-orange-700">
                Se connecter
              </Link>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.role === 'user'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User size={24} className={formData.role === 'user' ? 'text-orange-600' : 'text-slate-400'} />
              <div className="mt-2 font-medium text-sm text-slate-900">Particulier</div>
              <div className="text-xs text-slate-500">Chercher un bien</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'announcer' })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.role === 'announcer'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Building2 size={24} className={formData.role === 'announcer' ? 'text-orange-600' : 'text-slate-400'} />
              <div className="mt-2 font-medium text-sm text-slate-900">Annonceur</div>
              <div className="text-xs text-slate-500">Publier des biens</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nom complet" placeholder="Votre nom" icon={<User size={18} />} value={formData.full_name} onChange={update('full_name')} required />
            <Input label="Email" type="email" placeholder="votre@email.com" icon={<Mail size={18} />} value={formData.email} onChange={update('email')} required />
            <Input label="Telephone" type="tel" placeholder="+221 XX XXX XX XX" icon={<Phone size={18} />} value={formData.phone} onChange={update('phone')} />
            <Input label="Mot de passe" type="password" placeholder="Minimum 6 caracteres" icon={<Lock size={18} />} value={formData.password} onChange={update('password')} required />

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5" required />
              <span>
                J&apos;accepte les{' '}
                <Link href="/legal" className="text-orange-600 hover:underline">conditions d&apos;utilisation</Link>
              </span>
            </label>

            <Button variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {loading ? 'Creation...' : 'Creer mon compte'}
              {!loading && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
