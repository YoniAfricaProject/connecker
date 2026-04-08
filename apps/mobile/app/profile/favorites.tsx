import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function ProfileFavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (authLoading || !user) { setLoading(false); return; }
      setLoading(true);
      supabase.from('favorites').select('property_id, properties:property_id(*, property_images(*))').eq('user_id', user.id)
        .then(({ data }) => {
          setProperties((data || []).map((f: any) => f.properties).filter(Boolean));
          setLoading(false);
        });
    }, [user, authLoading])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Mes favoris</Text>
        <View style={{ width: 20 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={Colors.orange} style={{ marginTop: 40 }} />
      ) : properties.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={36} color={Colors.slate200} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySub}>Explorez les biens et cliquez sur le coeur</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          contentContainerStyle={{ padding: 14 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 12 },
  emptySub: { fontSize: 10, color: Colors.slate400, marginTop: 4 },
  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 10, overflow: 'hidden' },
  image: { width: 100, height: 88 },
  content: { flex: 1, padding: 10, justifyContent: 'center' },
  price: { fontSize: 13, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 11, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  city: { fontSize: 10, color: Colors.slate400, marginTop: 2 },
});
