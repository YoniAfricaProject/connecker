'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight, Building2 } from 'lucide-react';
import { Button, Input, Logo } from '@connecker/ui';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'user',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

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

          <form className="space-y-4">
            <Input
              label="Nom complet"
              placeholder="Votre nom"
              icon={<User size={18} />}
              value={formData.full_name}
              onChange={update('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={update('email')}
            />
            <Input
              label="Telephone"
              type="tel"
              placeholder="+221 XX XXX XX XX"
              icon={<Phone size={18} />}
              value={formData.phone}
              onChange={update('phone')}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Minimum 8 caracteres"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={update('password')}
            />

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5" />
              <span>
                J&apos;accepte les{' '}
                <Link href="/legal" className="text-orange-600 hover:underline">conditions d&apos;utilisation</Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline">politique de confidentialite</Link>
              </span>
            </label>

            <Button variant="primary" size="lg" className="w-full">
              Creer mon compte
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
