'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Building2, Home } from 'lucide-react';

const COMMUNES = [
  'Plateau', 'Almadies', 'Mermoz', 'Ngor', 'Ouakam', 'Yoff', 'Pikine',
  'Grand Yoff', 'Parcelles', 'Medina', 'HLM', 'Liberte', 'Fann',
  'Sacre Coeur', 'Guediawaye', 'Rufisque', 'Diamniadio',
];

const PRICE_DATA: Record<string, { appart_rent: number; house_rent: number; appart_sale: number; house_sale: number }> = {
  'Plateau': { appart_rent: 8500, house_rent: 12000, appart_sale: 1200000, house_sale: 1500000 },
  'Almadies': { appart_rent: 12000, house_rent: 18000, appart_sale: 1800000, house_sale: 2500000 },
  'Mermoz': { appart_rent: 7000, house_rent: 10000, appart_sale: 1000000, house_sale: 1400000 },
  'Ngor': { appart_rent: 9000, house_rent: 15000, appart_sale: 1500000, house_sale: 2000000 },
  'Ouakam': { appart_rent: 5500, house_rent: 8000, appart_sale: 800000, house_sale: 1100000 },
  'Yoff': { appart_rent: 5000, house_rent: 7500, appart_sale: 700000, house_sale: 950000 },
  'Pikine': { appart_rent: 3000, house_rent: 4500, appart_sale: 400000, house_sale: 550000 },
  'Grand Yoff': { appart_rent: 4000, house_rent: 6000, appart_sale: 550000, house_sale: 750000 },
  'Parcelles': { appart_rent: 3500, house_rent: 5000, appart_sale: 450000, house_sale: 650000 },
  'Medina': { appart_rent: 4500, house_rent: 7000, appart_sale: 600000, house_sale: 900000 },
  'HLM': { appart_rent: 4000, house_rent: 5500, appart_sale: 500000, house_sale: 700000 },
  'Liberte': { appart_rent: 5000, house_rent: 7000, appart_sale: 650000, house_sale: 900000 },
  'Fann': { appart_rent: 7500, house_rent: 11000, appart_sale: 1100000, house_sale: 1500000 },
  'Sacre Coeur': { appart_rent: 7000, house_rent: 10000, appart_sale: 1000000, house_sale: 1300000 },
  'Guediawaye': { appart_rent: 2500, house_rent: 4000, appart_sale: 350000, house_sale: 500000 },
  'Rufisque': { appart_rent: 2000, house_rent: 3500, appart_sale: 300000, house_sale: 450000 },
  'Diamniadio': { appart_rent: 3000, house_rent: 4000, appart_sale: 350000, house_sale: 500000 },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function EstimatePage() {
  const [commune, setCommune] = useState('');
  const [type, setType] = useState<'apartment' | 'house'>('apartment');
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [result, setResult] = useState<{ rent: number; sale: number } | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const data = PRICE_DATA[commune];
    if (!data || !surface) return;
    const s = Number(surface);
    const roomBonus = rooms ? (Number(rooms) - 2) * 0.03 : 0;
    const rentPerM2 = type === 'apartment' ? data.appart_rent : data.house_rent;
    const salePerM2 = type === 'apartment' ? data.appart_sale : data.house_sale;
    setResult({
      rent: Math.round(rentPerM2 * s * (1 + roomBonus)),
      sale: Math.round(salePerM2 * s * (1 + roomBonus)),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors">
        <ArrowLeft size={16} />Retour
      </Link>

      <div className="flex items-start gap-4 p-5 bg-orange-50 border border-orange-100 rounded-2xl mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Calculator size={22} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Estimation de bien</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Estimez la valeur de votre bien en fonction des prix du marché à Dakar.
          </p>
        </div>
      </div>

      <form onSubmit={calculate} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Type de bien</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('apartment')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${
                type === 'apartment' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Building2 size={16} />
              <span className="font-medium">Appartement</span>
            </button>
            <button
              type="button"
              onClick={() => setType('house')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${
                type === 'house' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Home size={16} />
              <span className="font-medium">Maison</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Commune</label>
          <div className="flex flex-wrap gap-2">
            {COMMUNES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCommune(c)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  commune === c ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Surface (m²)</label>
            <input
              type="number"
              inputMode="numeric"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="Ex : 80"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Nombre de pièces</label>
            <input
              type="number"
              inputMode="numeric"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              placeholder="Ex : 3"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min={0}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!commune || !surface}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          <Calculator size={16} />
          Estimer
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">Estimation pour {commune}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {type === 'apartment' ? 'Appartement' : 'Maison'} de {surface} m²{rooms ? `, ${rooms} pièces` : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">Loyer mensuel</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatPrice(result.rent)}</div>
              <div className="text-xs text-slate-400 mt-1">/ mois</div>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <div className="text-sm font-medium text-slate-500">Prix de vente</div>
              <div className="text-2xl font-extrabold text-orange-600 mt-1">{formatPrice(result.sale)}</div>
              <div className="text-xs text-slate-400 mt-1">estimation</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic mt-4 leading-relaxed">
            Estimation indicative basée sur les moyennes du marché. Les prix réels peuvent varier selon l&apos;état du bien, l&apos;emplacement exact et les prestations.
          </p>
        </div>
      )}
    </div>
  );
}
