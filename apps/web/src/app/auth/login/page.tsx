'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, Logo } from '@connecker/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
          alt="Immobilier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <Logo light className="mb-6" />
          <h2 className="text-3xl font-bold text-white">Bienvenue sur Connec&apos;Ker</h2>
          <p className="mt-3 text-slate-300">Connectez-vous pour gerer vos annonces et vos favoris.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo className="mb-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
            <p className="mt-2 text-slate-500">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-orange-600 font-medium hover:text-orange-700">
                Creer un compte
              </Link>
            </p>
          </div>

          <form className="space-y-5">
            <Input
              label="Adresse email"
              type="email"
              placeholder="votre@email.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                Se souvenir de moi
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                Mot de passe oublie ?
              </Link>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Se connecter
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 px-3 text-xs text-slate-400">ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="md" className="w-full">Google</Button>
            <Button variant="outline" size="md" className="w-full">Facebook</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
