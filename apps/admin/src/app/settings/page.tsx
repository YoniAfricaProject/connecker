'use client';

import React from 'react';
import { Globe, Shield, Database, Mail } from 'lucide-react';
import { Card } from '@connecker/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Parametres</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Globe size={20} /></div>
            <div>
              <h3 className="font-semibold text-slate-900">Site web</h3>
              <p className="text-xs text-slate-500">Configuration du site public</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">URL</span><span className="font-medium">connecker.vercel.app</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Devise</span><span className="font-medium">XOF</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pays par defaut</span><span className="font-medium">Senegal</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Langue</span><span className="font-medium">Francais</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Database size={20} /></div>
            <div>
              <h3 className="font-semibold text-slate-900">Base de donnees</h3>
              <p className="text-xs text-slate-500">Supabase</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Projet</span><span className="font-medium">connecker</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Region</span><span className="font-medium">EU West</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-medium">Free</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Mail size={20} /></div>
            <div>
              <h3 className="font-semibold text-slate-900">Contact</h3>
              <p className="text-xs text-slate-500">Informations de contact</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium">yoniservicesapp@gmail.com</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Telephone</span><span className="font-medium">+33 7 54 83 27 23</span></div>
            <div className="flex justify-between"><span className="text-slate-500">WhatsApp</span><span className="font-medium">+33 7 54 83 27 23</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Shield size={20} /></div>
            <div>
              <h3 className="font-semibold text-slate-900">Securite</h3>
              <p className="text-xs text-slate-500">Regles de moderation</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Validation annonces</span><span className="font-medium text-orange-600">Manuelle</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Expiration</span><span className="font-medium">90 jours</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Photo obligatoire</span><span className="font-medium">Oui</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
