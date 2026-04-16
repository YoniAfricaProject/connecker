import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth-context';
import { I18nProvider } from '../lib/i18n';
import { OfflineBanner } from '../components/offline-banner';

export default function RootLayout() {
  return (
    <I18nProvider>
    <AuthProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="splash" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="estimate/index" />
        <Stack.Screen name="pages/services" />
        <Stack.Screen name="pages/careers" />
        <Stack.Screen name="pages/advertising" />
        <Stack.Screen name="pages/contact" />
      </Stack>
      </View>
    </AuthProvider>
    </I18nProvider>
  );
}
