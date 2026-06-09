// RALY GROUP — © 2022-2025. All rights reserved.
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@connecker/ui', '@connecker/shared-types', '@connecker/supabase'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
