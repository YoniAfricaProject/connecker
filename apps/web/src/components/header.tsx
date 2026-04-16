'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Plus, LogOut, Heart, LayoutDashboard } from 'lucide-react';
import { Logo, Button } from '@connecker/ui';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/search?type=sale" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Acheter
            </Link>
            <Link href="/search?type=rent" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Louer
            </Link>
            <Link href="/estimate" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Estimer
            </Link>
            <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Services
            </Link>
            <Link href="/careers" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Carrieres
            </Link>
            <Link href="/advertising" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Publicites
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">
                    <Heart size={16} className="mr-2" />
                    Favoris
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-xs">
                      {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.full_name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <User size={14} /> Mon profil
                    </Link>
                    <Link href="/dashboard/favorites" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <Heart size={14} /> Mes favoris
                    </Link>
                    <Link href="/dashboard/properties" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <LayoutDashboard size={14} /> Mes annonces
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={14} /> Deconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <User size={16} className="mr-2" />
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    <Plus size={16} className="mr-2" />
                    Publier une annonce
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2">
            <Link href="/search?type=sale" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Acheter
            </Link>
            <Link href="/search?type=rent" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Louer
            </Link>
            <Link href="/estimate" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Estimer
            </Link>
            <Link href="/services" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Services
            </Link>
            <Link href="/careers" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Carrieres
            </Link>
            <Link href="/advertising" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Publicites
            </Link>
            <Link href="/contact" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Contact
            </Link>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link href="/favorites" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50">
                    Mes favoris
                  </Link>
                  <button onClick={signOut} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" size="sm" className="w-full">Se connecter</Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button variant="primary" size="sm" className="w-full">Publier une annonce</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
