'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, MessageSquare, Settings, Shield, LogOut, Image } from 'lucide-react';
import { Logo, cn } from '@connecker/ui';
import { useAdminAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: Building2, label: 'Annonces' },
  { href: '/users', icon: Users, label: 'Utilisateurs' },
  { href: '/leads', icon: MessageSquare, label: 'Leads' },
  { href: '/settings', icon: Settings, label: 'Parametres' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAdminAuth();

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

      {user && (
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
              {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-sm">
              <div className="text-white font-medium truncate">{user.full_name}</div>
              <div className="text-slate-500 text-xs truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-slate-800 w-full transition-colors">
            <LogOut size={16} />Deconnexion
          </button>
        </div>
      )}
    </aside>
  );
}
