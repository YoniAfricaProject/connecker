import Link from 'next/link';
import { ArrowRight, Shield, Search, Users, TrendingUp, Building2, MapPin } from 'lucide-react';
import { PropertyCard, SearchBar, Button, Badge } from '@connecker/ui';
import { FEATURED_PROPERTIES, POPULAR_CITIES, PROPERTY_TYPES } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Immobilier moderne"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="max-w-2xl space-y-6">
            <Badge variant="new" className="text-sm">
              Nouvelle plateforme immobiliere
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight text-balance">
              Trouvez le bien
              <span className="text-orange-400"> ideal </span>
              au Senegal
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Des milliers d&apos;annonces verifiees pour l&apos;achat, la vente et la location de biens immobiliers dans tout le Senegal.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-4xl">
            <SearchBar />
          </div>

          {/* Quick stats */}
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { value: '2,500+', label: 'Annonces' },
              { value: '150+', label: 'Villes' },
              { value: '1,200+', label: 'Annonceurs' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Explorer par type de bien</h2>
            <p className="mt-3 text-slate-500">Trouvez exactement ce que vous cherchez</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROPERTY_TYPES.map(({ type, label, icon, count }) => (
              <Link
                key={type}
                href={`/search?property_type=${type}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-300"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-medium text-slate-900 text-sm">{label}</span>
                <span className="text-xs text-slate-400">{count} annonces</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Annonces en vedette</h2>
              <p className="mt-3 text-slate-500">Nos biens les plus populaires du moment</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PROPERTIES.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <PropertyCard property={property} />
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/search">
              <Button variant="outline">Voir toutes les annonces</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Villes populaires</h2>
            <p className="mt-3 text-slate-500">Explorez l&apos;immobilier dans les principales villes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_CITIES.map(({ name, count, image }) => (
              <Link
                key={name}
                href={`/search?city=${name}`}
                className="group relative h-64 rounded-2xl overflow-hidden"
              >
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin size={16} className="text-orange-400" />
                    <h3 className="text-xl font-bold">{name}</h3>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{count} annonces disponibles</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Pourquoi Connec&apos;Ker ?</h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
              La plateforme qui connecte les Senegalais a leur futur chez-eux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield size={28} />,
                title: 'Annonces verifiees',
                desc: 'Chaque annonce est verifiee par notre equipe avant publication.',
              },
              {
                icon: <Search size={28} />,
                title: 'Recherche intelligente',
                desc: 'Filtres avances et carte interactive pour trouver le bien parfait.',
              },
              {
                icon: <Users size={28} />,
                title: 'Mise en relation directe',
                desc: 'Contactez directement les annonceurs, sans intermediaire cache.',
              },
              {
                icon: <TrendingUp size={28} />,
                title: 'Marche transparent',
                desc: 'Des prix reels et des informations completes sur chaque bien.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mx-auto">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Building2 size={48} className="text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous avez un bien a proposer ?
          </h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;annonceurs et touchez des acheteurs qualifies dans tout le Senegal.
          </p>
          <Link href="/auth/register">
            <Button variant="secondary" size="lg">
              Publier gratuitement
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
