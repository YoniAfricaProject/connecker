// RALY GROUP — © 2022-2025. All rights reserved.
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/'],
    },
    sitemap: 'https://connecker.vercel.app/sitemap.xml',
  };
}
