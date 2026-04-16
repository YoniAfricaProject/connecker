import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';
import { withTimeout } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function FavoritesTab() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    if (authLoading || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    withTimeout(
      supabase.from('favorites').select('property_id, properties:property_id(*, property_images(*))').eq('user_id', user.id)
    )
      .then(({ data }) => {
        setProperties((data || []).map((f: any) => f.properties).filter(Boolean));
        setLoading(false);
      })
      .catch((e) => { setError(e instanceof Error ? e : new Error(String(e))); setLoading(false); });
  }, [user, authLoading]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!authLoading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={Colors.slate300} />
        <Text style={styles.title}>{t('auth.connectRequired')}</Text>
        <Text style={styles.sub}>{t('favorites.connectRequired')}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{t('favorites.title')}</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.slate400} />
      </TouchableOpacity>
    </View>
    <View style={styles.container}>
      <DataState loading={loading} error={error} onRetry={load}>
      {properties.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color={Colors.slate300} />
          <Text style={styles.title}>{t('favorites.empty')}</Text>
          <Text style={styles.sub}>{t('favorites.emptySub')}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.buttonText}>{t('favorites.exploreBtn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: p }) => {
            const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
            return (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/property/${p.id}`)}>
                {img ? <Image source={{ uri: img.url }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: Colors.slate100 }]} />}
                <View style={styles.content}>
                  <Text style={styles.price}>{formatPrice(p.price)}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.city}>{p.city}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
        />
      )}
      </DataState>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.slate900 },
  container: { flex: 1, backgroundColor: Colors.slate50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  title: { fontSize: 18, fontWeight: '700', color: Colors.slate900, marginTop: 14 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 5, textAlign: 'center' },
  button: { backgroundColor: Colors.orange, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 16 },
  buttonText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 10, overflow: 'hidden' },
  image: { width: 100, height: 88 },
  content: { flex: 1, padding: 10, justifyContent: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  city: { fontSize: 13, color: Colors.slate400, marginTop: 2 },
});
