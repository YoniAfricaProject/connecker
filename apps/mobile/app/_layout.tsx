import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="splash" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Retour' }} />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="estimate/index" />
        <Stack.Screen name="pages/services" />
        <Stack.Screen name="pages/careers" />
        <Stack.Screen name="pages/advertising" />
        <Stack.Screen name="pages/contact" />
      </Stack>
    </AuthProvider>
  );
}
