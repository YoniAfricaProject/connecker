import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function SearchTab() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; city?: string; district?: string; property_type?: string }>();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  // Read filters from URL params
  useFocusEffect(
    useCallback(() => {
      if (params.type) setTransactionType(params.type);
      if (params.city) setCity(params.city);
      if (params.district) setDistrict(params.district);
      if (params.property_type) setType(params.property_type);
      fetchProperties(params.type, params.city, params.district, params.property_type);
    }, [params.type, params.city, params.district, params.property_type])
  );

  async function fetchProperties(txType?: string, filterCity?: string, filterDistrict?: string, propType?: string) {
    setLoading(true);
    let query = supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('created_at', { ascending: false });

    const t = txType !== undefined ? txType : transactionType;
    const c = filterCity !== undefined ? filterCity : city;
    const d = filterDistrict !== undefined ? filterDistrict : district;
    const p = propType !== undefined ? propType : type;

    if (t) query = query.eq('transaction_type', t);
    if (c) query = query.ilike('city', `%${c}%`);
    if (d) query = query.ilike('district', `%${d}%`);
    if (p) query = query.eq('property_type', p);
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
      {/* Fixed header */}
      <View style={styles.fixedHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={14} color={Colors.slate400} />
          <TextInput
            placeholder="Ville, quartier, type..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchProperties()}
            returnKeyType="search"
            style={styles.searchInput}
            placeholderTextColor={Colors.slate400}
          />
        </View>

        {/* Active filters */}
        {(city || district || transactionType) && (
          <View style={styles.activeFilters}>
            {transactionType && <View style={styles.activeTag}><Text style={styles.activeTagText}>{transactionType === 'sale' ? 'Achat' : 'Location'}</Text></View>}
            {city && <View style={styles.activeTag}><Text style={styles.activeTagText}>{city}</Text></View>}
            {district && <View style={styles.activeTag}><Text style={styles.activeTagText}>{district}</Text></View>}
            <TouchableOpacity onPress={() => { setTransactionType(''); setCity(''); setDistrict(''); setType(''); setSearch(''); fetchProperties('', '', '', ''); }}>
              <Text style={styles.clearText}>Effacer</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 }}
        >
          {TYPES.map(item => (
            <TouchableOpacity key={item.value} onPress={() => { setType(item.value); fetchProperties(transactionType, city, district, item.value); }} style={[styles.chip, type === item.value && styles.chipActive]}>
              <Text style={[styles.chipText, type === item.value && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="small" color={Colors.orange} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={properties}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 20 }}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={36} color={Colors.slate200} />
              <Text style={styles.emptyTitle}>Aucun bien trouve</Text>
              <Text style={styles.emptySub}>Modifiez vos filtres pour elargir la recherche</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => { setTransactionType(''); setCity(''); setDistrict(''); setType(''); setSearch(''); fetchProperties('', '', '', ''); }}>
                <Text style={styles.emptyBtnText}>Effacer les filtres</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  fixedHeader: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100, zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, marginHorizontal: 14, marginTop: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: Colors.slate200 },
  searchInput: { flex: 1, fontSize: 12, color: Colors.slate900 },
  activeFilters: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingTop: 6 },
  activeTag: { backgroundColor: Colors.orange + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeTagText: { fontSize: 9, fontWeight: '500', color: Colors.orange },
  clearText: { fontSize: 9, color: Colors.slate400, marginLeft: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: Colors.slate100, marginRight: 5 },
  chipActive: { backgroundColor: Colors.orange },
  chipText: { fontSize: 9, fontWeight: '500', color: Colors.slate600 },
  chipTextActive: { color: Colors.white },
  listCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 10, overflow: 'hidden' },
  listImage: { width: 100, height: 88 },
  listContent: { flex: 1, padding: 10, justifyContent: 'center' },
  listPrice: { fontSize: 13, fontWeight: '800', color: Colors.orange },
  listTitle: { fontSize: 11, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  listCity: { fontSize: 10, color: Colors.slate400, marginTop: 2 },
  listFeatures: { flexDirection: 'row', gap: 8, marginTop: 5 },
  listFeature: { fontSize: 9, color: Colors.slate500 },
  emptyContainer: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 12 },
  emptySub: { fontSize: 10, color: Colors.slate400, marginTop: 4, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.orange, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  emptyBtnText: { fontSize: 11, fontWeight: '600', color: Colors.white },
});
