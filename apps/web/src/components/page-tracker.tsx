'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getSupabase();
    supabase.from('page_views').insert({
      path: pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    }).then(() => {});
  }, [pathname]);

  return null;
}
