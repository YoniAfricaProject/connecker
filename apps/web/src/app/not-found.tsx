import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button, Logo } from '@connecker/ui';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-orange-500/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page introuvable</h1>
        <p className="text-slate-500 mb-8">
          La page que vous cherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home size={16} className="mr-2" />
              Retour a l&apos;accueil
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              <Search size={16} className="mr-2" />
              Rechercher un bien
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
