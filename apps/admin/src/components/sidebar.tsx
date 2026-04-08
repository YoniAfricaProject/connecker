'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, MessageSquare, Settings, Shield, LogOut, Briefcase, Megaphone, AlertTriangle, Bell, FileText, Handshake } from 'lucide-react';
import { Logo, cn } from '@connecker/ui';
import { useAdminAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: Building2, label: 'Annonces' },
  { href: '/users', icon: Users, label: 'Utilisateurs' },
  { href: '/leads', icon: MessageSquare, label: 'Leads' },
  { href: '/reports', icon: AlertTriangle, label: 'Signalements' },
  { href: '/services', icon: Handshake, label: 'Services' },
  { href: '/jobs', icon: Briefcase, label: 'Carrieres' },
  { href: '/contracts', icon: Megaphone, label: 'Publicites' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/logs', icon: FileText, label: 'Logs' },
  { href: '/settings', icon: Settings, label: 'Parametres' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAdminAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-900 text-white flex flex-col z-40">
      <div className="p-5 border-b border-slate-800">
        <Logo light />
        <div className="mt-1.5 flex items-center gap-1.5">
          <Shield size={10} className="text-orange-400" />
          <span className="text-[10px] text-slate-400 font-medium">Administration</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                active ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
              <Icon size={15} />{label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
              {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="text-[11px] text-white font-medium truncate max-w-[120px]">{user.full_name}</div>
              <div className="text-[9px] text-slate-500">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-red-400 hover:bg-slate-800 w-full">
            <LogOut size={13} />Deconnexion
          </button>
        </div>
      )}
    </aside>
  );
}
