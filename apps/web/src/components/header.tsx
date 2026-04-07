'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Heart, Plus } from 'lucide-react';
import { Logo, Button } from '@connecker/ui';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/search?type=sale" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Acheter
            </Link>
            <Link href="/search?type=rent" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Louer
            </Link>
            <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Rechercher
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
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
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2">
            <Link href="/search?type=sale" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Acheter
            </Link>
            <Link href="/search?type=rent" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Louer
            </Link>
            <Link href="/search" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Rechercher
            </Link>
            <Link href="/contact" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">
              Contact
            </Link>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link href="/auth/login" className="block">
                <Button variant="outline" size="sm" className="w-full">Se connecter</Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="primary" size="sm" className="w-full">Publier une annonce</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
