'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, MessageSquare, Settings, Shield, LogOut, Briefcase, Megaphone, AlertTriangle, Bell, FileText, Handshake, Menu, X } from 'lucide-react';
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

export function MobileMenuButton() {
  return null;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAdminAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <Logo light />
          <div className="mt-1.5 flex items-center gap-1.5">
            <Shield size={10} className="text-orange-400" />
            <span className="text-[10px] text-slate-400 font-medium">Administration</span>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
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
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 h-14">
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-1.5">
          <Logo light />
          <Shield size={10} className="text-orange-400" />
        </div>
        <div className="w-8" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-slate-900 text-white flex-col z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
