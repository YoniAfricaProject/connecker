import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.connecker.app',
  appName: "Connec'Kër",
  webDir: 'public',
  server: {
    // Point to the live Vercel site
    url: 'https://connecker.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'ConnecKer',
  },
  android: {
    backgroundColor: '#0f172a',
  },
};

export default config;
