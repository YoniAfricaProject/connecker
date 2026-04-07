'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Heart, Share2, MapPin, BedDouble, Bath, Maximize, Calendar,
  Eye, Phone, Mail, ChevronLeft, ChevronRight, Check, Building2
} from 'lucide-react';
import { Button, Badge, Input } from '@connecker/ui';
import { formatPrice, formatSurface } from '@connecker/ui';
import { FEATURED_PROPERTIES } from '@/lib/mock-data';

export default function PropertyDetailPage() {
  const params = useParams();
  const property = FEATURED_PROPERTIES.find(p => p.id === params.id) || FEATURED_PROPERTIES[0];
  const [currentImage, setCurrentImage] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/search" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Retour aux resultats
      </Link>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[16/9] bg-slate-100">
        <img
          src={property.images[currentImage]?.url || ''}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Image nav */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentImage(Math.min(property.images.length - 1, currentImage + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
            <Heart size={18} className="text-slate-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
            <Share2 size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant={property.transaction_type === 'sale' ? 'sale' : 'rent'} className="text-sm">
            {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{property.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-slate-500">
                  <MapPin size={16} className="text-orange-500" />
                  <span>{property.district ? `${property.district}, ` : ''}{property.city}, {property.country}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {formatPrice(property.price, property.currency)}
                </div>
                {property.transaction_type === 'rent' && (
                  <span className="text-sm text-slate-500">/mois</span>
                )}
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Maximize size={20} />, value: formatSurface(property.surface_area), label: 'Surface' },
              { icon: <BedDouble size={20} />, value: String(property.bedrooms), label: 'Chambres' },
              { icon: <Bath size={20} />, value: String(property.bathrooms), label: 'Sdb' },
              { icon: <Building2 size={20} />, value: property.property_type, label: 'Type' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-orange-500">{icon}</div>
                <div>
                  <div className="font-semibold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
            <p className="text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Features/Amenities */}
          {property.features.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Equipements & prestations</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-slate-400 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Eye size={14} />
              <span>{property.views_count} vues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Publie le {new Date(property.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Contact */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 sticky top-24">
            <h3 className="text-lg font-semibold text-slate-900">Contacter l&apos;annonceur</h3>

            <form className="space-y-4">
              <Input
                label="Nom complet"
                placeholder="Votre nom"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
              <Input
                label="Telephone"
                type="tel"
                placeholder="+221 XX XXX XX XX"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="Je suis interesse par ce bien..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <Button variant="primary" className="w-full" size="lg">
                <Mail size={16} className="mr-2" />
                Envoyer un message
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" size="lg">
              <Phone size={16} className="mr-2" />
              Appeler directement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
