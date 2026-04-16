import { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Dropdown } from '../../components/dropdown';
import { VILLES, DAKAR_COMMUNES, PROPERTY_TYPES } from '../../lib/dakar-data';
import { Colors } from '../../lib/colors';
import { useI18n } from '../../lib/i18n';
import { withTimeout } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function SearchTab() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ type?: string; city?: string; district?: string; property_type?: string }>();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [] as string[], availability: '' });

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
    setError(null);
    let query = supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('created_at', { ascending: false });

    const tx = txType !== undefined ? txType : transactionType;
    const c = filterCity !== undefined ? filterCity : city;
    const d = filterDistrict !== undefined ? filterDistrict : district;
    const p = propType !== undefined ? propType : type;

    if (tx) query = query.eq('transaction_type', tx);
    if (c) query = query.ilike('city', `%${c}%`);
    if (d) query = query.ilike('district', `%${d}%`);
    if (p) query = query.eq('property_type', p);
    if (search) query = query.or(`city.ilike.%${search}%,title.ilike.%${search}%,district.ilike.%${search}%`);
    if (advancedFilters.priceMin) query = query.gte('price', Number(advancedFilters.priceMin));
    if (advancedFilters.priceMax) query = query.lte('price', Number(advancedFilters.priceMax));
    if (advancedFilters.rooms) query = query.gte('rooms', Number(advancedFilters.rooms));
    if (advancedFilters.bedrooms) query = query.gte('bedrooms', Number(advancedFilters.bedrooms));
    if (advancedFilters.surfaceMin) query = query.gte('surface_area', Number(advancedFilters.surfaceMin));
    if (advancedFilters.surfaceMax) query = query.lte('surface_area', Number(advancedFilters.surfaceMax));
    if (advancedFilters.features.length > 0) query = query.contains('features', advancedFilters.features);

    try {
      const { data } = await withTimeout(query.limit(20));
      setProperties(data || []);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }

  const TYPES = [
    { value: '', label: t('common.all') },
    { value: 'apartment', label: t('type.apartment') },
    { value: 'house', label: t('type.house') },
    { value: 'villa', label: t('type.villa') },
    { value: 'land', label: t('type.land') },
    { value: 'studio', label: t('type.studio') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{t('search.title')}</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.slate400} />
      </TouchableOpacity>
    </View>
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.fixedHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={14} color={Colors.slate400} />
            <TextInput
              placeholder={t('search.placeholder')}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => fetchProperties()}
              returnKeyType="search"
              style={styles.searchInput}
              placeholderTextColor={Colors.slate400}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltersModalOpen(true)}>
            <Ionicons name="options-outline" size={18} color={Colors.orange} />
          </TouchableOpacity>
        </View>

        {/* Active filters */}
        {(city || district || transactionType) && (
          <View style={styles.activeFilters}>
            {transactionType && <View style={styles.activeTag}><Text style={styles.activeTagText}>{transactionType === 'sale' ? t('search.purchase') : t('home.rental')}</Text></View>}
            {city && <View style={styles.activeTag}><Text style={styles.activeTagText}>{city}</Text></View>}
            {district && <View style={styles.activeTag}><Text style={styles.activeTagText}>{district}</Text></View>}
            <TouchableOpacity onPress={() => { setTransactionType(''); setCity(''); setDistrict(''); setType(''); setSearch(''); fetchProperties('', '', '', ''); }}>
              <Text style={styles.clearText}>{t('common.clear')}</Text>
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
      <DataState loading={loading} error={error} onRetry={() => fetchProperties()} compact>
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
              <Text style={styles.emptyTitle}>{t('search.noResults')}</Text>
              <Text style={styles.emptySub}>{t('search.noResultsSub')}</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => { setTransactionType(''); setCity(''); setDistrict(''); setType(''); setSearch(''); fetchProperties('', '', '', ''); }}>
                <Text style={styles.emptyBtnText}>{t('search.clearFilters')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </DataState>
    </View>

    {/* Modal filtres avances */}
    <Modal visible={filtersModalOpen} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('search.advancedFilters')}</Text>
            <TouchableOpacity onPress={() => setFiltersModalOpen(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.slate400} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Transaction */}
            <Text style={styles.fLabel}>{t('search.transaction')}</Text>
            <View style={styles.fChipsRow}>
              {[{ v: '', l: t('common.all') }, { v: 'sale', l: t('search.purchase') }, { v: 'rent', l: t('home.rental') }].map(({ v, l }) => (
                <TouchableOpacity key={v} style={[styles.fChip, transactionType === v && styles.fChipActive]} onPress={() => setTransactionType(v)}>
                  <Text style={[styles.fChipText, transactionType === v && styles.fChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ville */}
            <Text style={styles.fLabel}>{t('search.city')}</Text>
            <Dropdown
              icon="location-outline"
              label={t('search.city')}
              value={city}
              placeholder="Toutes"
              options={[{ value: '', label: t('search.allCities') }, ...VILLES.map(v => ({ value: v, label: v }))]}
              onSelect={v => { setCity(v); setDistrict(''); }}
            />

            {/* Commune */}
            {city === 'Dakar' && (
              <>
                <Text style={styles.fLabel}>{t('search.commune')}</Text>
                <Dropdown
                  icon="business-outline"
                  label={t('search.commune')}
                  value={district}
                  placeholder="Toutes"
                  options={[{ value: '', label: t('search.allCommunes') }, ...Object.keys(DAKAR_COMMUNES).map(c => ({ value: c, label: c }))]}
                  onSelect={v => setDistrict(v)}
                />
              </>
            )}

            {/* Quartier */}
            {district && DAKAR_COMMUNES[district] && (
              <>
                <Text style={styles.fLabel}>{t('search.neighborhood')}</Text>
                <Dropdown
                  icon="navigate-outline"
                  label={t('search.neighborhood')}
                  value={''}
                  placeholder="Tous"
                  options={[{ value: '', label: t('search.allNeighborhoods') }, ...DAKAR_COMMUNES[district].map(q => ({ value: q, label: q }))]}
                  onSelect={v => setDistrict(v || district)}
                />
              </>
            )}

            {/* Type de bien */}
            <Text style={styles.fLabel}>{t('search.propertyType')}</Text>
            <Dropdown
              icon="home-outline"
              label="Type"
              value={type}
              placeholder="Tous"
              options={[{ value: '', label: t('search.allTypes') }, ...PROPERTY_TYPES.filter(pt => pt.value)]}
              onSelect={v => setType(v)}
            />

            {/* Prix */}
            <Text style={styles.fLabel}>{t('search.price')}</Text>
            <View style={styles.fRow}>
              <TextInput style={styles.fInput} placeholder="Min" keyboardType="numeric" value={advancedFilters.priceMin} onChangeText={v => setAdvancedFilters({ ...advancedFilters, priceMin: v })} placeholderTextColor={Colors.slate400} />
              <Text style={styles.fSep}>-</Text>
              <TextInput style={styles.fInput} placeholder="Max" keyboardType="numeric" value={advancedFilters.priceMax} onChangeText={v => setAdvancedFilters({ ...advancedFilters, priceMax: v })} placeholderTextColor={Colors.slate400} />
            </View>

            {/* Pieces */}
            <Text style={styles.fLabel}>{t('search.minRooms')}</Text>
            <View style={styles.fChipsRow}>
              {['', '1', '2', '3', '4', '5+'].map(v => (
                <TouchableOpacity key={v} style={[styles.fChip, advancedFilters.rooms === v && styles.fChipActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, rooms: advancedFilters.rooms === v ? '' : v })}>
                  <Text style={[styles.fChipText, advancedFilters.rooms === v && styles.fChipTextActive]}>{v || t('common.all')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chambres */}
            <Text style={styles.fLabel}>{t('search.minBedrooms')}</Text>
            <View style={styles.fChipsRow}>
              {['', '1', '2', '3', '4', '5+'].map(v => (
                <TouchableOpacity key={v} style={[styles.fChip, advancedFilters.bedrooms === v && styles.fChipActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, bedrooms: advancedFilters.bedrooms === v ? '' : v })}>
                  <Text style={[styles.fChipText, advancedFilters.bedrooms === v && styles.fChipTextActive]}>{v || t('common.all')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Surface */}
            <Text style={styles.fLabel}>{t('search.surface')}</Text>
            <View style={styles.fRow}>
              <TextInput style={styles.fInput} placeholder="Min" keyboardType="numeric" value={advancedFilters.surfaceMin} onChangeText={v => setAdvancedFilters({ ...advancedFilters, surfaceMin: v })} placeholderTextColor={Colors.slate400} />
              <Text style={styles.fSep}>-</Text>
              <TextInput style={styles.fInput} placeholder="Max" keyboardType="numeric" value={advancedFilters.surfaceMax} onChangeText={v => setAdvancedFilters({ ...advancedFilters, surfaceMax: v })} placeholderTextColor={Colors.slate400} />
            </View>

            {/* Caracteristiques */}
            <Text style={styles.fLabel}>{t('search.features')}</Text>
            <View style={styles.fFeaturesWrap}>
              {['Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur', 'Balcon', 'Terrasse', 'Gardien', 'Parking', 'Vue mer', 'Meuble', 'Cuisine equipee', 'Titre foncier'].map(f => (
                <TouchableOpacity key={f} style={[styles.fFeature, advancedFilters.features.includes(f) && styles.fFeatureActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, features: advancedFilters.features.includes(f) ? advancedFilters.features.filter(x => x !== f) : [...advancedFilters.features, f] })}>
                  <Text style={[styles.fFeatureText, advancedFilters.features.includes(f) && styles.fFeatureTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Boutons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalResetBtn} onPress={() => setAdvancedFilters({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [], availability: '' })}>
              <Text style={styles.modalResetText}>{t('common.reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalApplyBtn} onPress={() => { setFiltersModalOpen(false); fetchProperties(); }}>
              <Text style={styles.modalApplyText}>{t('common.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.slate900 },
  container: { flex: 1, backgroundColor: Colors.slate50 },
  fixedHeader: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100, zIndex: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: Colors.slate200 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.slate900 },
  activeFilters: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingTop: 6 },
  activeTag: { backgroundColor: Colors.orange + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeTagText: { fontSize: 12, fontWeight: '500', color: Colors.orange },
  clearText: { fontSize: 12, color: Colors.slate400, marginLeft: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: Colors.slate100, marginRight: 5 },
  chipActive: { backgroundColor: Colors.orange },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.slate600 },
  chipTextActive: { color: Colors.white },
  listCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 12, overflow: 'hidden' },
  listImage: { width: 100, height: 88 },
  listContent: { flex: 1, padding: 12, justifyContent: 'center' },
  listPrice: { fontSize: 16, fontWeight: '800', color: Colors.orange },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  listCity: { fontSize: 13, color: Colors.slate400, marginTop: 2 },
  listFeatures: { flexDirection: 'row', gap: 8, marginTop: 5 },
  listFeature: { fontSize: 12, color: Colors.slate500 },
  emptyContainer: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.slate900, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.slate400, marginTop: 4, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.orange, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  // Search row with filter button
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: 6, gap: 8, paddingRight: 2 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.orangeLight + '20', borderWidth: 1, borderColor: Colors.orange + '30', justifyContent: 'center', alignItems: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 16, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.slate900 },
  modalActions: { flexDirection: 'row', gap: 10, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  modalResetBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.slate200 },
  modalResetText: { fontSize: 14, fontWeight: '500', color: Colors.slate500 },
  modalApplyBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.orange },
  modalApplyText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  // Filter fields
  fLabel: { fontSize: 13, fontWeight: '700', color: Colors.slate700, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  fRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fInput: { flex: 1, borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },
  fSep: { fontSize: 16, color: Colors.slate400 },
  fChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: Colors.slate100 },
  fChipActive: { backgroundColor: Colors.orange },
  fChipText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  fChipTextActive: { color: Colors.white },
  fFeaturesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fFeature: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.slate100 },
  fFeatureActive: { backgroundColor: Colors.orange },
  fFeatureText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  fFeatureTextActive: { color: Colors.white },
});
