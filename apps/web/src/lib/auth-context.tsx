'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from './supabase';
import type { User as AppUser } from '@connecker/shared-types';

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: { email: string; password: string; full_name: string; phone: string; role: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchOrCreateProfile(authUser: any) {
    const supabase = getSupabase();

    // Try to fetch existing profile
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (data) {
      setUser(data as AppUser);
      setLoading(false);
      return;
    }

    // No profile found - create one (since trigger is disabled)
    const meta = authUser.user_metadata || {};
    const { data: newUser, error } = await supabase
      .from('users')
      .upsert({
        auth_id: authUser.id,
        email: authUser.email,
        full_name: meta.full_name || authUser.email?.split('@')[0] || 'Utilisateur',
        phone: meta.phone || null,
        role: ['user', 'announcer', 'admin'].includes(meta.role) ? meta.role : 'user',
      }, { onConflict: 'email' })
      .select()
      .single();

    if (newUser) {
      setUser(newUser as AppUser);
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signUp(data: { email: string; password: string; full_name: string; phone: string; role: string }) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        },
      },
    });
    if (error) return { error: error.message };
    return {};
  }

  async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
