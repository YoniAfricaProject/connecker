import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function FavoritesTab() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }
    supabase.from('favorites').select('property_id, properties:property_id(*, property_images(*))').eq('user_id', user.id)
      .then(({ data }) => {
        setProperties((data || []).map((f: any) => f.properties).filter(Boolean));
        setLoading(false);
      });
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={Colors.slate300} />
        <Text style={styles.title}>Connectez-vous</Text>
        <Text style={styles.sub}>Pour sauvegarder vos biens preferes</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.orange} /></View>;

  return (
    <View style={styles.container}>
      {properties.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color={Colors.slate300} />
          <Text style={styles.title}>Aucun favori</Text>
          <Text style={styles.sub}>Explorez les biens et cliquez sur le coeur</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.buttonText}>Explorer</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  title: { fontSize: 18, fontWeight: '700', color: Colors.slate900, marginTop: 16 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 6, textAlign: 'center' },
  button: { backgroundColor: Colors.orange, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginTop: 20 },
  buttonText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  card: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 12, overflow: 'hidden' },
  image: { width: 110, height: 100 },
  content: { flex: 1, padding: 12, justifyContent: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 13, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  city: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
});
