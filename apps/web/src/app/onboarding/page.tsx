'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, Users, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    Icon: Home,
    title: 'Trouvez votre bien idéal',
    description: "Des milliers d'annonces vérifiées pour l'achat, la vente et la location au Sénégal.",
    color: 'text-orange-500',
    bg: 'bg-orange-100',
  },
  {
    Icon: Search,
    title: 'Recherche intelligente',
    description: 'Filtrez par ville, quartier, type de bien, budget et surface pour trouver exactement ce que vous cherchez.',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    Icon: Users,
    title: 'Contact direct',
    description: 'Contactez les annonceurs directement par WhatsApp, téléphone ou formulaire.',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true') {
      router.replace('/');
    }
  }, [router]);

  const handleDone = () => {
    try { localStorage.setItem('onboarded', 'true'); } catch {}
    router.replace('/');
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) setIndex(index + 1);
    else handleDone();
  };

  const slide = SLIDES[index];

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      <button
        onClick={handleDone}
        className="absolute top-6 right-6 text-sm text-slate-500 hover:text-slate-700 transition-colors z-10"
      >
        Passer
      </button>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <div className={`w-24 h-24 rounded-full ${slide.bg} flex items-center justify-center mx-auto mb-8`}>
            <slide.Icon size={44} className={slide.color} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{slide.title}</h1>
          <p className="text-base text-slate-500 leading-relaxed">{slide.description}</p>
        </div>
      </div>

      <div className="pb-10 px-6">
        <div className="flex justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-orange-500' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {index === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
