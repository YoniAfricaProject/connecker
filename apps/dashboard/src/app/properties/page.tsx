'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, MoreVertical, Eye, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Button, Badge, Card } from '@connecker/ui';
import { formatPrice } from '@connecker/ui';

const MY_PROPERTIES = [
  { id: '1', title: 'Villa moderne avec piscine', city: 'Dakar', price: 285000000, currency: 'XOF', type: 'villa', status: 'published' as const, views: 234, leads: 12, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80' },
  { id: '2', title: 'Appartement T3 standing Plateau', city: 'Dakar', price: 850000, currency: 'XOF', type: 'apartment', status: 'published' as const, views: 189, leads: 8, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' },
  { id: '3', title: 'Terrain constructible Saly', city: 'Mbour', price: 45000000, currency: 'XOF', type: 'land', status: 'pending' as const, views: 0, leads: 0, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80' },
];

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mes annonces</h1>
        <Link href="/properties/new">
          <Button variant="primary">
            <Plus size={16} className="mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {MY_PROPERTIES.map((prop) => (
          <Card key={prop.id} className="p-4">
            <div className="flex gap-4">
              <img src={prop.image} alt={prop.title} className="w-32 h-24 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{prop.title}</h3>
                    <p className="text-sm text-slate-500">{prop.city}</p>
                  </div>
                  <Badge variant={prop.status === 'published' ? 'sale' : 'default'}>
                    {prop.status === 'published' ? 'Active' : 'En attente'}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-6">
                  <span className="text-lg font-bold text-orange-600">{formatPrice(prop.price, prop.currency)}</span>
                  <span className="flex items-center gap-1 text-sm text-slate-400"><Eye size={14} />{prop.views}</span>
                  <span className="flex items-center gap-1 text-sm text-slate-400"><MessageSquare size={14} />{prop.leads}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <Edit size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
