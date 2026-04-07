import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'published');

  const propertyUrls = (properties || []).map((p: any) => ({
    url: `https://connecker.vercel.app/properties/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://connecker.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://connecker.vercel.app/search', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://connecker.vercel.app/services', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://connecker.vercel.app/careers', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://connecker.vercel.app/advertising', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://connecker.vercel.app/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...propertyUrls,
  ];
}
