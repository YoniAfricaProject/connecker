'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ChevronRight, Search, Building2, Calendar, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Badge, Card } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';

const JOB_TYPES = ['Tous', 'CDI', 'CDD', 'Freelance', 'Stage'];

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().from('jobs').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false); });
  }, []);

  const filtered = jobs.filter(j => {
    if (typeFilter !== 'Tous' && j.type !== typeFilter) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeJob = jobs.find(j => j.id === selectedJob);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <Badge variant="new" className="mb-4">Recrutement</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Carrieres dans l&apos;immobilier</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Decouvrez les meilleures opportunites d&apos;emploi dans le secteur immobilier au Senegal.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Briefcase, value: `${jobs.length}`, label: 'Offres actives', color: 'bg-orange-100 text-orange-600' },
          { icon: Building2, value: `${new Set(jobs.map(j => j.company)).size}`, label: 'Entreprises', color: 'bg-blue-100 text-blue-600' },
          { icon: MapPin, value: `${new Set(jobs.map(j => j.city)).size}`, label: 'Villes', color: 'bg-emerald-100 text-emerald-600' },
          { icon: Users, value: '150+', label: 'Candidatures/mois', color: 'bg-purple-100 text-purple-600' },
        ].map(({ icon: Icon, value, label, color }) => (
          <Card key={label} className="p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}><Icon size={20} /></div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher un poste ou une entreprise..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {JOB_TYPES.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${typeFilter === type ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">Aucune offre ne correspond a vos criteres.</p>
              </div>
            ) : filtered.map((job) => (
              <Card key={job.id} hover className={`p-5 cursor-pointer transition-all ${selectedJob === job.id ? 'ring-2 ring-orange-500' : ''}`}>
                <div onClick={() => setSelectedJob(job.id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-orange-600 font-medium">{job.company}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={12} />{job.district ? `${job.district}, ` : ''}{job.city}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={job.type === 'CDI' ? 'sale' : job.type === 'CDD' ? 'rent' : 'default'}>{job.type}</Badge>
                    {job.experience && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} />{job.experience}</span>}
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} />{new Date(job.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {activeJob ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeJob.title}</h2>
                  <p className="text-orange-600 font-medium mt-1">{activeJob.company}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={15} className="text-orange-400" />{activeJob.district ? `${activeJob.district}, ` : ''}{activeJob.city}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Briefcase size={15} className="text-orange-400" />{activeJob.type}{activeJob.experience ? ` - ${activeJob.experience}` : ''}</div>
                  {activeJob.salary && <div className="flex items-center gap-2 text-sm text-slate-600"><span className="text-orange-400 font-bold">$</span>{activeJob.salary}</div>}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{activeJob.description}</p>
                </div>
                {activeJob.tags?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-2">Competences</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeJob.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Button variant="primary" size="lg" className="w-full">Postuler <ArrowRight size={16} className="ml-2" /></Button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center sticky top-24">
                <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Selectionnez une offre pour voir les details</p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="mt-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Vous recrutez ?</h2>
        <p className="text-orange-100 mb-6 max-w-xl mx-auto">Publiez vos offres d&apos;emploi et touchez les meilleurs talents du secteur immobilier.</p>
        <Link href="/contact"><Button variant="secondary" size="lg">Publier une offre <ArrowRight size={16} className="ml-2" /></Button></Link>
      </section>
    </div>
  );
}
