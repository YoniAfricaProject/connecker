'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from './supabase';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchAdmin(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchAdmin(session.user);
      else { setUser(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchAdmin(authUser: any) {
    const supabase = getSupabase();

    // Try by auth_id first
    let { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .in('role', ['admin', 'super_admin'])
      .single();

    // If not found, try by email and link auth_id
    if (!data) {
      const email = authUser.email;
      const { data: byEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (byEmail) {
        await supabase.from('users').update({ auth_id: authUser.id }).eq('id', byEmail.id);
        if (byEmail.role === 'admin' || byEmail.role === 'super_admin') {
          data = { ...byEmail, auth_id: authUser.id };
        }
      }
    }

    setUser(data as AdminUser | null);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
