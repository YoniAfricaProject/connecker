'use client';
// RALY GROUP — © 2022-2025. All rights reserved.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (localStorage.getItem('onboarded') !== 'true') {
        router.replace('/onboarding');
      }
    } catch {}
  }, [router]);

  return null;
}
