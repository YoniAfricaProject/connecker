'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Save, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Card } from '@connecker/ui';
import { DAKAR_COMMUNES, OTHER_CITIES, PROPERTY_TYPE_OPTIONS } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';

const FEATURE_OPTIONS = [
  'Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur', 'Balcon',
  'Terrasse', 'Gardien', 'Parking', 'Vue mer', 'Meuble', 'Wifi',
  'Fibre optique', 'Securite', 'Cuisine equipee', 'Titre foncier', 'Viabilise',
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'apartment',
    transaction_type: 'sale', price: '', currency: 'XOF',
    surface_area: '', rooms: '', bedrooms: '', bathrooms: '',
    address: '', city: '', district: '', country: 'SN', features: [] as string[],
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter(u => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.description || !form.price || !form.address || !form.city) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (imageUrls.length === 0) {
      setError('Ajoutez au moins une photo');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const supabase = getSupabase();

      // Create property
      const { data: property, error: propError } = await supabase
        .from('properties')
        .insert({
          title: form.title,
          description: form.description,
          property_type: form.property_type,
          transaction_type: form.transaction_type,
          price: Number(form.price),
          currency: form.currency,
          surface_area: form.surface_area ? Number(form.surface_area) : null,
          rooms: form.rooms ? Number(form.rooms) : null,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
          address: form.address,
          city: form.city,
          district: form.district || null,
          country: form.country,
          features: form.features,
          announcer_id: user.id,
          status: 'published',
        })
        .select()
        .single();

      if (propError) throw propError;

      // Add images
      const images = imageUrls.map((url, i) => ({
        property_id: property.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      }));

      await supabase.from('property_images').insert(images);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication');
    }
    setSaving(false);
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Annonce publiee !</h1>
        <p className="text-slate-500 mb-6">Votre bien est maintenant visible sur la plateforme.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/properties"><Button variant="outline">Voir mes annonces</Button></Link>
          <Link href="/search"><Button variant="primary">Voir sur le site</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/properties" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle annonce</h1>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos generales */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Informations generales</h2>
          <Input label="Titre de l'annonce *" placeholder="Ex: Belle villa avec piscine aux Almadies" value={form.title} onChange={update('title')} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea rows={5} placeholder="Decrivez votre bien en detail..." value={form.description} onChange={update('description')} required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de bien</label>
              <select value={form.property_type} onChange={update('property_type')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {PROPERTY_TYPE_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction</label>
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
            <Input label="Prix (XOF) *" type="number" placeholder="Ex: 50000000" value={form.price} onChange={update('price')} required />
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
            <Input label="Adresse *" placeholder="Ex: Rue 10, Almadies" value={form.address} onChange={update('address')} required />
            <Input label="Ville *" placeholder="Ex: Dakar" value={form.city} onChange={update('city')} required />
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
          <h2 className="text-lg font-semibold text-slate-900">Photos *</h2>
          <p className="text-sm text-slate-500">Ajoutez des URLs de photos de votre bien. La premiere sera la photo principale.</p>

          <div className="flex gap-2">
            <Input placeholder="https://exemple.com/photo.jpg" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1" />
            <Button type="button" variant="outline" onClick={addImageUrl}>Ajouter</Button>
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative group">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Principale</span>
                  )}
                  <button type="button" onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Equipements */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Equipements</h2>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((feature) => (
              <button key={feature} type="button"
                onClick={() => setForm({
                  ...form,
                  features: form.features.includes(feature)
                    ? form.features.filter(f => f !== feature)
                    : [...form.features, feature],
                })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.features.includes(feature)
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-orange-300'
                }`}>
                {feature}
              </button>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/properties">
            <Button variant="outline" size="lg">Annuler</Button>
          </Link>
          <Button variant="primary" size="lg" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            {saving ? 'Publication...' : 'Publier l\'annonce'}
          </Button>
        </div>
      </form>
    </div>
  );
}
