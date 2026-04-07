'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone, Mail, Check, ArrowRight, Zap, Crown, Rocket,
  BarChart3, Eye, Users, Target, Star, Megaphone
} from 'lucide-react';
import { Button, Badge, Card } from '@connecker/ui';

const PLANS = [
  {
    id: 'standard',
    name: 'Pack Standard',
    price: '50 000',
    period: '/mois',
    description: 'Ideal pour commencer votre visibilite sur la plateforme.',
    icon: Zap,
    color: 'from-slate-600 to-slate-700',
    features: [
      'Annonce mise en avant 7 jours',
      'Badge "Recommande" sur vos annonces',
      'Statistiques basiques',
      'Support email',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    price: '150 000',
    period: '/mois',
    description: 'Le meilleur rapport qualite-prix pour une visibilite optimale.',
    icon: Crown,
    color: 'from-orange-500 to-orange-600',
    features: [
      'Tout le Pack Standard',
      'Banniere de pleine page (1 mois)',
      'Annonces en tete des resultats',
      'Statistiques detaillees + leads',
      'Badge "Verifie" premium',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Pack Entreprise',
    price: 'Sur mesure',
    period: '',
    description: 'Solution complete pour les agences et promoteurs.',
    icon: Rocket,
    color: 'from-slate-800 to-slate-900',
    features: [
      'Tout le Pack Premium',
      'Bannieres multiples (pleine page, demi-page)',
      'Liens sponsorises',
      'Banniere deroulante animee',
      'API d\'integration',
      'Account manager dedie',
      'Rapports personnalises',
    ],
    popular: false,
  },
];

const AD_FORMATS = [
  {
    name: 'Banniere pleine page',
    description: 'Affichee en haut de la homepage. Maximum d\'impact visuel.',
    size: '1200 x 400 px',
    price: '100 000 XOF/semaine',
    impressions: '~15 000/semaine',
  },
  {
    name: 'Banniere deroulante',
    description: 'Animation fluide dans les resultats de recherche.',
    size: '728 x 90 px',
    price: '75 000 XOF/semaine',
    impressions: '~10 000/semaine',
  },
  {
    name: 'Annonce demi-page',
    description: 'Visible sur les pages de detail des biens similaires.',
    size: '300 x 600 px',
    price: '50 000 XOF/semaine',
    impressions: '~8 000/semaine',
  },
  {
    name: 'Lien sponsorise',
    description: 'Votre lien en premiere position dans les resultats de recherche.',
    size: 'Texte + lien',
    price: '25 000 XOF/semaine',
    impressions: '~12 000/semaine',
  },
];

export default function AdvertisingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="premium" className="mb-4">Publicite</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Boostez votre visibilite <br />
            <span className="text-orange-400">sur Connec&apos;Ker</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            Touchez des milliers d&apos;acheteurs et locataires qualifies chaque jour grace a nos solutions publicitaires.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { icon: Eye, value: '50 000+', label: 'Vues mensuelles' },
              { icon: Users, value: '8 000+', label: 'Utilisateurs actifs' },
              { icon: Target, value: '14%', label: 'Taux de conversion' },
              { icon: BarChart3, value: '92%', label: 'Satisfaction client' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon size={24} className="text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Nos offres commerciales</h2>
            <p className="mt-3 text-slate-500">Choisissez le pack adapte a vos objectifs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 p-7 flex flex-col ${
                    plan.popular
                      ? 'border-orange-500 shadow-xl shadow-orange-500/10 scale-105'
                      : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                        Le plus populaire
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} text-white flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    Choisir ce pack
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ad Formats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Formats publicitaires</h2>
            <p className="mt-3 text-slate-500">Des emplacements strategiques pour un maximum de visibilite</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AD_FORMATS.map((format) => (
              <Card key={format.name} hover className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{format.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{format.description}</p>
                  </div>
                  <Megaphone size={24} className="text-orange-400 flex-shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400">Format</div>
                    <div className="text-sm font-medium text-slate-900">{format.size}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Tarif</div>
                    <div className="text-sm font-medium text-orange-600">{format.price}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Impressions</div>
                    <div className="text-sm font-medium text-slate-900">{format.impressions}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Departement Commercial</h2>
          <p className="text-orange-100 mb-8">
            Notre equipe est disponible pour vous accompagner dans le choix de la meilleure solution publicitaire.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              <Phone size={18} className="mr-2" />
              Appelez-nous
            </Button>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Mail size={18} className="mr-2" />
                Contactez-nous par email
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
