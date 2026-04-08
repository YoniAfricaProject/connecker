import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

const { width } = Dimensions.get('window');

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function HomeTab() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('properties').select('*, property_images(*)').eq('status', 'published')
      .order('views_count', { ascending: false }).limit(6)
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Trouvez le bien{'\n'}
          <Text style={styles.heroAccent}>ideal </Text>
          au Senegal
        </Text>
        <Text style={styles.heroSub}>Achat, vente et location de biens immobiliers</Text>
        <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={18} color={Colors.white} />
          <Text style={styles.searchButtonText}>Rechercher un bien</Text>
        </TouchableOpacity>
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Annonces en vedette</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.orange} style={{ paddingVertical: 40 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
            {properties.map(p => {
              const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
              return (
                <TouchableOpacity key={p.id} style={styles.card} onPress={() => router.push(`/property/${p.id}`)}>
                  {img ? (
                    <Image source={{ uri: img.url }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardImage, { backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 30 }}>🏠</Text>
                    </View>
                  )}
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{p.transaction_type === 'sale' ? 'Vente' : 'Location'}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardPrice}>{formatPrice(p.price)}{p.transaction_type === 'rent' ? '/mois' : ''}</Text>
                    <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                    <View style={styles.cardLocation}>
                      <Ionicons name="location-outline" size={12} color={Colors.slate400} />
                      <Text style={styles.cardCity}>{p.district ? `${p.district}, ` : ''}{p.city}</Text>
                    </View>
                    <View style={styles.cardFeatures}>
                      {p.bedrooms != null && <Text style={styles.cardFeature}>{p.bedrooms} ch.</Text>}
                      {p.bathrooms != null && <Text style={styles.cardFeature}>{p.bathrooms} sdb</Text>}
                      {p.surface_area != null && <Text style={styles.cardFeature}>{p.surface_area} m²</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Quick access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explorer</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: 'business-outline', label: 'Appartements', type: 'apartment' },
            { icon: 'home-outline', label: 'Maisons', type: 'house' },
            { icon: 'leaf-outline', label: 'Villas', type: 'villa' },
            { icon: 'map-outline', label: 'Terrains', type: 'land' },
          ].map(({ icon, label, type }) => (
            <TouchableOpacity key={type} style={styles.quickItem} onPress={() => router.push(`/(tabs)/search?property_type=${type}`)}>
              <View style={styles.quickIcon}>
                <Ionicons name={icon as any} size={24} color={Colors.orange} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: { backgroundColor: Colors.slate900, padding: 24, paddingTop: 70, paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, lineHeight: 36 },
  heroAccent: { color: Colors.orange },
  heroSub: { fontSize: 14, color: Colors.slate400, marginTop: 8 },
  searchButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.orange, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, marginTop: 20, gap: 8 },
  searchButtonText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900 },
  seeAll: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
  card: { width: width * 0.7, marginRight: 14, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  cardImage: { width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: Colors.green + 'dd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  cardContent: { padding: 12 },
  cardPrice: { fontSize: 17, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 4 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  cardCity: { fontSize: 12, color: Colors.slate400 },
  cardFeatures: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cardFeature: { fontSize: 12, color: Colors.slate500 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.orangeLight + '40', justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '500', color: Colors.slate700, marginTop: 8 },
});
