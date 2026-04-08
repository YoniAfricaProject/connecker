import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function SearchTab() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => { fetchProperties(); }, [type]);

  async function fetchProperties() {
    setLoading(true);
    let query = supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('created_at', { ascending: false });
    if (type) query = query.eq('property_type', type);
    if (search) query = query.or(`city.ilike.%${search}%,title.ilike.%${search}%,district.ilike.%${search}%`);
    const { data } = await query.limit(20);
    setProperties(data || []);
    setLoading(false);
  }

  const TYPES = [
    { value: '', label: 'Tous' },
    { value: 'apartment', label: 'Appart.' },
    { value: 'house', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Terrain' },
    { value: 'studio', label: 'Studio' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.slate400} />
        <TextInput
          placeholder="Ville, quartier, type..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchProperties}
          returnKeyType="search"
          style={styles.searchInput}
          placeholderTextColor={Colors.slate400}
        />
      </View>

      <FlatList
        horizontal
        data={TYPES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setType(item.value)} style={[styles.chip, type === item.value && styles.chipActive]}>
            <Text style={[styles.chipText, type === item.value && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.value}
      />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.orange} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={properties}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item: p }) => {
            const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
            return (
              <TouchableOpacity style={styles.listCard} onPress={() => router.push(`/property/${p.id}`)}>
                {img ? <Image source={{ uri: img.url }} style={styles.listImage} /> : <View style={[styles.listImage, { backgroundColor: Colors.slate100 }]} />}
                <View style={styles.listContent}>
                  <Text style={styles.listPrice}>{formatPrice(p.price)}{p.transaction_type === 'rent' ? '/mois' : ''}</Text>
                  <Text style={styles.listTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.listCity}>{p.district ? `${p.district}, ` : ''}{p.city}</Text>
                  <View style={styles.listFeatures}>
                    {p.bedrooms != null && <Text style={styles.listFeature}>{p.bedrooms} ch</Text>}
                    {p.surface_area != null && <Text style={styles.listFeature}>{p.surface_area} m²</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.empty}>Aucun bien trouve</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, marginHorizontal: 16, marginTop: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, gap: 10, borderWidth: 1, borderColor: Colors.slate200 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.slate900 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.slate100, marginRight: 8 },
  chipActive: { backgroundColor: Colors.orange },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  chipTextActive: { color: Colors.white },
  listCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 12, overflow: 'hidden' },
  listImage: { width: 110, height: 100 },
  listContent: { flex: 1, padding: 12, justifyContent: 'center' },
  listPrice: { fontSize: 16, fontWeight: '800', color: Colors.orange },
  listTitle: { fontSize: 13, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  listCity: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  listFeatures: { flexDirection: 'row', gap: 10, marginTop: 6 },
  listFeature: { fontSize: 11, color: Colors.slate500 },
  empty: { textAlign: 'center', color: Colors.slate400, marginTop: 40, fontSize: 14 },
});
