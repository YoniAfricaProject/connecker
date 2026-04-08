import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../lib/colors';

export default function Index() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => setHasOnboarded(val === 'true'));
  }, []);

  if (hasOnboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.slate900 }}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    );
  }

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
