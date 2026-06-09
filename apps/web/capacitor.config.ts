// RALY GROUP — © 2022-2025. All rights reserved.
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.connecker.app',
  appName: "Connec'Ker",
  webDir: 'public',
  server: {
    url: 'https://connecker.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'App',
  },
  android: {
    backgroundColor: '#0f172a',
  },
};

export default config;
