'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, MapPin, Clock, ChevronRight, Search, Building2,
  Calendar, Users, ArrowRight, Filter
} from 'lucide-react';
import { Button, Badge, Card, Input } from '@connecker/ui';

const JOB_LISTINGS = [
  {
    id: '1', title: 'Agent immobilier senior', company: 'Agence Dakar Immo',
    city: 'Dakar', district: 'Plateau', type: 'CDI', experience: '3 a 5 ans',
    salary: '500 000 - 800 000 XOF', posted: '2026-04-05',
    description: 'Nous recherchons un agent immobilier experimente pour gerer un portefeuille de clients premium sur Dakar et sa banlieue. Vous serez en charge de la prospection, des visites et de la negociation.',
    tags: ['Vente', 'Negociation', 'Portefeuille clients'],
  },
  {
    id: '2', title: 'Developpeur Full Stack', company: 'Connec\'Ker',
    city: 'Dakar', district: 'Almadies', type: 'CDI', experience: '2 a 3 ans',
    salary: '600 000 - 1 000 000 XOF', posted: '2026-04-06',
    description: 'Rejoignez notre equipe technique pour developper la plateforme immobiliere de reference au Senegal. Stack: Next.js, React, Supabase, Tailwind CSS.',
    tags: ['React', 'Next.js', 'TypeScript', 'Supabase'],
  },
  {
    id: '3', title: 'Architecte d\'interieur', company: 'Archi Design Sn',
    city: 'Dakar', district: 'Almadies', type: 'Freelance', experience: '3 a 5 ans',
    salary: 'Sur devis', posted: '2026-04-03',
    description: 'Nous cherchons un architecte d\'interieur pour des projets de standing (villas, appartements haut de gamme). Portfolio requis.',
    tags: ['Design', 'Decoration', 'Projets luxe'],
  },
  {
    id: '4', title: 'Charge(e) de clientele immobilier', company: 'BHS',
    city: 'Dakar', district: 'Plateau', type: 'CDI', experience: '1 a 2 ans',
    salary: '350 000 - 500 000 XOF', posted: '2026-04-01',
    description: 'La Banque de l\'Habitat recrute un(e) charge(e) de clientele specialise(e) dans les credits immobiliers. Formation bancaire souhaitee.',
    tags: ['Banque', 'Credit immobilier', 'Relation client'],
  },
  {
    id: '5', title: 'Geometre topographe', company: 'SCI Dakar Invest',
    city: 'Thies', district: 'Centre', type: 'CDD', experience: '2 a 3 ans',
    salary: '400 000 - 600 000 XOF', posted: '2026-03-28',
    description: 'Mission de 6 mois pour des travaux de bornage et de leve topographique sur plusieurs lots dans la region de Thies.',
    tags: ['Topographie', 'Bornage', 'Terrain'],
  },
  {
    id: '6', title: 'Commercial(e) terrain', company: 'Touba Immobilier',
    city: 'Dakar', district: 'Mermoz', type: 'CDI', experience: '1 a 2 ans',
    salary: '300 000 + commissions', posted: '2026-04-07',
    description: 'Poste de commercial terrain pour la vente de programmes neufs. Vehicule fourni, commissions attractives sur les ventes.',
    tags: ['Vente', 'Prospection', 'Programmes neufs'],
  },
];

const JOB_TYPES = ['Tous', 'CDI', 'CDD', 'Freelance', 'Stage'];

export default function CareersPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const filtered = JOB_LISTINGS.filter(j => {
    if (typeFilter !== 'Tous' && j.type !== typeFilter) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeJob = JOB_LISTINGS.find(j => j.id === selectedJob);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="new" className="mb-4">Recrutement</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Carrieres dans l&apos;immobilier</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Decouvrez les meilleures opportunites d&apos;emploi dans le secteur immobilier au Senegal.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Briefcase, value: `${JOB_LISTINGS.length}`, label: 'Offres actives', color: 'bg-orange-100 text-orange-600' },
          { icon: Building2, value: '25+', label: 'Entreprises', color: 'bg-blue-100 text-blue-600' },
          { icon: MapPin, value: '10+', label: 'Villes', color: 'bg-emerald-100 text-emerald-600' },
          { icon: Users, value: '150+', label: 'Candidatures/mois', color: 'bg-purple-100 text-purple-600' },
        ].map(({ icon: Icon, value, label, color }) => (
          <Card key={label} className="p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={20} />
            </div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un poste ou une entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">Aucune offre ne correspond a vos criteres.</p>
            </div>
          ) : (
            filtered.map((job) => (
              <Card
                key={job.id}
                hover
                className={`p-5 cursor-pointer transition-all ${selectedJob === job.id ? 'ring-2 ring-orange-500' : ''}`}
              >
                <div onClick={() => setSelectedJob(job.id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-orange-600 font-medium">{job.company}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <MapPin size={12} />{job.district}, {job.city}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={job.type === 'CDI' ? 'sale' : job.type === 'CDD' ? 'rent' : 'default'}>{job.type}</Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />{job.experience}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />{new Date(job.posted).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {activeJob ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeJob.title}</h2>
                <p className="text-orange-600 font-medium mt-1">{activeJob.company}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={15} className="text-orange-400" />
                  <span>{activeJob.district}, {activeJob.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase size={15} className="text-orange-400" />
                  <span>{activeJob.type} - {activeJob.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-orange-400 font-bold text-base">$</span>
                  <span>{activeJob.salary}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{activeJob.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">Competences</h3>
                <div className="flex flex-wrap gap-2">
                  {activeJob.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full">
                Postuler <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center sticky top-24">
              <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Selectionnez une offre pour voir les details</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <section className="mt-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Vous recrutez ?</h2>
        <p className="text-orange-100 mb-6 max-w-xl mx-auto">
          Publiez vos offres d&apos;emploi et touchez les meilleurs talents du secteur immobilier.
        </p>
        <Link href="/contact">
          <Button variant="secondary" size="lg">
            Publier une offre <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
