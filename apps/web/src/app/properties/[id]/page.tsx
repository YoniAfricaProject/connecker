'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Heart, Share2, MapPin, BedDouble, Bath, Maximize, Calendar,
  Eye, Phone, Mail, ChevronLeft, ChevronRight, Check, Building2, Loader2,
  MessageCircle, Copy, CheckCircle
} from 'lucide-react';
import { Button, Badge, Input } from '@connecker/ui';
import { formatPrice, formatSurface } from '@connecker/ui';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toggleFavorite } from '@/lib/favorites';
import { PropertyMap } from '@/components/property-map';
import type { Property } from '@connecker/shared-types';

export default function PropertyDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Pre-fill contact form with logged-in user info
  useEffect(() => {
    if (user) {
      setContactForm(f => ({
        ...f,
        name: f.name || user.full_name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(*), users!announcer_id(*)')
        .eq('id', params.id)
        .single();

      if (data) {
        setProperty({
          ...data,
          images: (data.property_images || []).map((img: any) => ({
            id: img.id, url: img.url, caption: img.caption,
            is_primary: img.is_primary, order: img.sort_order,
          })),
          announcer: data.users || undefined,
        } as any);
        try { await supabase.rpc('increment_views', { property_id: params.id }); } catch {}
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  // Check if favorite
  useEffect(() => {
    if (!user || !params.id) return;
    const supabase = getSupabase();
    supabase.from('favorites').select('id').eq('user_id', user.id).eq('property_id', params.id).single()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, params.id]);

  const handleFavorite = async () => {
    if (!user || !property) {
      window.location.href = '/auth/login';
      return;
    }
    await toggleFavorite(user.id, property.id, isFavorite);
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = property ? `${property.title} - ${formatPrice(property.price, property.currency)}` : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title, text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (!property) return;
    const phone = property.announcer?.phone?.replace(/\s/g, '').replace('+', '') || '';
    const msg = encodeURIComponent(
      `Bonjour, je suis interesse(e) par votre annonce "${property.title}" sur Connec'Ker.\n${window.location.href}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSending(true);
    try {
      const supabase = getSupabase();
      await supabase.from('leads').insert({
        property_id: property.id,
        sender_name: contactForm.name,
        sender_email: contactForm.email,
        sender_phone: contactForm.phone || null,
        message: contactForm.message,
      });
      setSent(true);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Bien non trouve</h1>
        <Link href="/search"><Button variant="outline" className="mt-4">Retour a la recherche</Button></Link>
      </div>
    );
  }

  const images = property.images || [];
  const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/search" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors">
        <ArrowLeft size={16} />Retour aux resultats
      </Link>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[16/9] bg-slate-100">
        {sortedImages.length > 0 ? (
          <img src={sortedImages[currentImage]?.url} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">🏠</div>
        )}
        {sortedImages.length > 1 && (
          <>
            <button onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentImage(Math.min(sortedImages.length - 1, currentImage + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {sortedImages.map((_, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`w-2 h-2 rounded-full transition ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant={property.transaction_type === 'sale' ? 'sale' : 'rent'} className="text-sm">
            {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleFavorite}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
            <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'} />
          </button>
          <button onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
            {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Share2 size={18} className="text-slate-600" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{property.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <MapPin size={16} className="text-orange-500" />
                <span>{property.district ? `${property.district}, ` : ''}{property.city}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{formatPrice(property.price, property.currency)}</div>
              {property.transaction_type === 'rent' && <span className="text-sm text-slate-500">/mois</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Maximize size={20} />, value: property.surface_area ? formatSurface(property.surface_area) : '-', label: 'Surface' },
              { icon: <BedDouble size={20} />, value: String(property.bedrooms ?? '-'), label: 'Chambres' },
              { icon: <Bath size={20} />, value: String(property.bathrooms ?? '-'), label: 'Sdb' },
              { icon: <Building2 size={20} />, value: property.property_type, label: 'Type' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-orange-500">{icon}</div>
                <div><div className="font-semibold text-slate-900">{value}</div><div className="text-xs text-slate-500">{label}</div></div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {property.features && property.features.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Equipements & prestations</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />{feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.announcer && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Annonceur</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                  {property.announcer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{property.announcer.full_name}</div>
                  {property.announcer.company_name && <div className="text-xs text-slate-500">{property.announcer.company_name}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Localisation</h2>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
                className="h-[300px] rounded-xl overflow-hidden border border-slate-200"
              />
              <p className="text-xs text-slate-400 mt-2">
                {property.district ? `${property.district}, ` : ''}{property.city}
              </p>
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-slate-400 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><Eye size={14} /><span>{property.views_count} vues</span></div>
            <div className="flex items-center gap-1.5"><Calendar size={14} /><span>Publie le {new Date(property.created_at).toLocaleDateString('fr-FR')}</span></div>
          </div>
        </div>

        {/* Sidebar - Contact */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 sticky top-24">
            <h3 className="text-lg font-semibold text-slate-900">Contacter l&apos;annonceur</h3>

            {/* WhatsApp button */}
            {property.announcer?.phone && (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
              >
                <MessageCircle size={18} />
                Contacter via WhatsApp
              </button>
            )}

            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h4 className="font-semibold text-slate-900">Message envoye !</h4>
                <p className="text-sm text-slate-500 mt-2">L&apos;annonceur vous recontactera bientot.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <Input label="Nom complet" placeholder="Votre nom" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                <Input label="Email" type="email" placeholder="votre@email.com" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                <Input label="Telephone" type="tel" placeholder="+221 XX XXX XX XX" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Je suis interesse par ce bien..." required value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>
                <Button variant="primary" className="w-full" size="lg" disabled={sending}>
                  {sending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Mail size={16} className="mr-2" />}
                  {sending ? 'Envoi...' : 'Envoyer un message'}
                </Button>
              </form>
            )}

            {property.announcer?.phone && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">ou</span></div>
                </div>
                <Button variant="outline" className="w-full" size="lg" onClick={() => window.open(`tel:${property.announcer?.phone}`)}>
                  <Phone size={16} className="mr-2" />
                  Appeler directement
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
