'use client';

import React, { useState } from 'react';
import { Upload, X, ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Card } from '@connecker/ui';
import type { PropertyType, TransactionType } from '@connecker/shared-types';

export default function NewPropertyPage() {
  const [form, setForm] = useState({
    title: '', description: '', property_type: 'apartment' as PropertyType,
    transaction_type: 'sale' as TransactionType, price: '', currency: 'XOF',
    surface_area: '', rooms: '', bedrooms: '', bathrooms: '',
    address: '', city: '', district: '', country: 'SN', features: [] as string[],
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const FEATURE_OPTIONS = ['Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur', 'Balcon', 'Terrasse', 'Gardien', 'Parking', 'Vue mer', 'Meuble', 'Wifi', 'Fibre optique', 'Securite'];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/properties" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle annonce</h1>
      </div>

      <form className="space-y-6">
        {/* Informations generales */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Informations generales</h2>

          <Input label="Titre de l'annonce" placeholder="Ex: Belle villa avec piscine" value={form.title} onChange={update('title')} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={5} placeholder="Decrivez votre bien en detail..." value={form.description} onChange={update('description')}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de bien</label>
              <select value={form.property_type} onChange={update('property_type')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="land">Terrain</option>
                <option value="office">Bureau</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de transaction</label>
              <select value={form.transaction_type} onChange={update('transaction_type')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="sale">Vente</option>
                <option value="rent">Location</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Prix & Surface */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Prix & Caracteristiques</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Prix (XOF)" type="number" placeholder="Ex: 50000000" value={form.price} onChange={update('price')} />
            <Input label="Surface (m2)" type="number" placeholder="Ex: 120" value={form.surface_area} onChange={update('surface_area')} />
            <Input label="Pieces" type="number" placeholder="Ex: 4" value={form.rooms} onChange={update('rooms')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Chambres" type="number" placeholder="Ex: 3" value={form.bedrooms} onChange={update('bedrooms')} />
            <Input label="Salles de bain" type="number" placeholder="Ex: 2" value={form.bathrooms} onChange={update('bathrooms')} />
          </div>
        </Card>

        {/* Localisation */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Localisation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Adresse" placeholder="Ex: Rue 10, Almadies" value={form.address} onChange={update('address')} />
            <Input label="Ville" placeholder="Ex: Dakar" value={form.city} onChange={update('city')} />
            <Input label="Quartier" placeholder="Ex: Almadies" value={form.district} onChange={update('district')} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pays</label>
              <select value={form.country} onChange={update('country')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="SN">Senegal</option>
                <option value="CI">Cote d&apos;Ivoire</option>
                <option value="ML">Mali</option>
                <option value="GN">Guinee</option>
                <option value="CM">Cameroun</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-orange-400 transition-colors cursor-pointer">
            <Upload size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">Glissez vos photos ou cliquez pour parcourir</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG - Max 5MB par photo - Minimum 1 photo requise</p>
          </div>
        </Card>

        {/* Equipements */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Equipements</h2>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    features: form.features.includes(feature)
                      ? form.features.filter(f => f !== feature)
                      : [...form.features, feature],
                  });
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.features.includes(feature)
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-orange-300'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="lg">
            <Eye size={16} className="mr-2" />
            Apercu
          </Button>
          <Button variant="primary" size="lg">
            <Save size={16} className="mr-2" />
            Publier l&apos;annonce
          </Button>
        </div>
      </form>
    </div>
  );
}
