// RALY GROUP — © 2022-2025. All rights reserved.
import { createBrowserClient as createSupaBrowserClient } from '@supabase/ssr';
import { createServerClient as createSupaServerClient } from '@supabase/ssr';
import type { CookieMethods } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupaBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServerClient(cookies: CookieMethods) {
  return createSupaServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}
