'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, BarChart3, Shield, LogOut } from 'lucide-react';
import { Logo, cn } from '@connecker/ui';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: Building2, label: 'Annonces' },
  { href: '/users', icon: Users, label: 'Utilisateurs' },
  { href: '/stats', icon: BarChart3, label: 'Statistiques' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-slate-800">
        <Logo light />
        <div className="mt-2 flex items-center gap-2">
          <Shield size={12} className="text-orange-400" />
          <span className="text-xs text-slate-400 font-medium">Administration</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
              <Icon size={18} />{label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-slate-800 w-full transition-colors">
          <LogOut size={18} />Deconnexion
        </button>
      </div>
    </aside>
  );
}
