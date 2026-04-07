'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, MessageSquare, Settings, LogOut, Plus } from 'lucide-react';
import { Logo, Button, cn } from '@connecker/ui';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Tableau de bord' },
  { href: '/properties', icon: Building2, label: 'Mes annonces' },
  { href: '/leads', icon: MessageSquare, label: 'Demandes' },
  { href: '/settings', icon: Settings, label: 'Parametres' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Logo />
      </div>

      {/* New property CTA */}
      <div className="px-4 pt-6 pb-2">
        <Link href="/properties/new">
          <Button variant="primary" className="w-full" size="sm">
            <Plus size={16} className="mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors">
          <LogOut size={18} />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
