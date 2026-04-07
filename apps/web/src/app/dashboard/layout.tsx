'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Building2, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button, Logo } from '@connecker/ui';

const NAV = [
  { href: '/dashboard/profile', icon: User, label: 'Mon profil' },
  { href: '/dashboard/favorites', icon: Heart, label: 'Mes favoris' },
  { href: '/dashboard/properties', icon: Building2, label: 'Mes annonces' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Connectez-vous</h1>
          <p className="text-slate-500 mb-6">Vous devez etre connecte pour acceder a votre espace.</p>
          <Link href="/auth/login"><Button variant="primary">Se connecter</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 mb-6">
        <ArrowLeft size={16} /> Retour au site
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 sticky top-24">
            {user && (
              <div className="flex items-center gap-3 p-3 mb-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                  {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{user.full_name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
              </div>
            )}

            {NAV.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            {user?.role === 'announcer' && (
              <Link href="/dashboard/properties/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 mt-2 border-t border-slate-100 pt-3">
                <Plus size={18} /> Publier une annonce
              </Link>
            )}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
