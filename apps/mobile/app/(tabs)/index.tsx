import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { withTimeout } from '../../lib/use-async-data';
import { cacheWrap } from '../../lib/cache';
import { DataState } from '../../components/data-state';
import { useAuth } from '../../lib/auth-context';
import { SideMenu } from '../../components/side-menu';
import { Dropdown } from '../../components/dropdown';
import { VILLES, DAKAR_COMMUNES, PROPERTY_TYPES } from '../../lib/dakar-data';
import { Colors } from '../../lib/colors';
import { useI18n } from '../../lib/i18n';

const { width } = Dimensions.get('window');

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function HomeTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' });
  const [advancedFilters, setAdvancedFilters] = useState({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [] as string[], availability: '' });
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [newListings, setNewListings] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const loadHome = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    Promise.allSettled([
      cacheWrap('home:featured', async () => {
        const res = await withTimeout(supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('views_count', { ascending: false }).limit(6));
        return res.data || [];
      }),
      cacheWrap('home:newest', async () => {
        const res = await withTimeout(supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('created_at', { ascending: false }).limit(4));
        return res.data || [];
      }),
    ]).then((results) => {
      const [featuredRes, newestRes] = results;
      if (featuredRes.status === 'fulfilled') setProperties(featuredRes.value);
      if (newestRes.status === 'fulfilled') setNewListings(newestRes.value);
      if (featuredRes.status === 'rejected' && newestRes.status === 'rejected') {
        setLoadError(featuredRes.reason instanceof Error ? featuredRes.reason : new Error(String(featuredRes.reason)));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadHome(); }, [loadHome]);

  // Reload recently viewed every time tab gets focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('recently_viewed').then(val => {
        if (val) {
          const ids = JSON.parse(val) as string[];
          if (ids.length > 0) {
            withTimeout(supabase.from('properties').select('*, property_images(*)').in('id', ids).limit(6))
              .then(({ data }) => {
                if (data) {
                  const sorted = ids.map(rid => data.find((p: any) => p.id === rid)).filter(Boolean);
                  setRecentlyViewed(sorted);
                }
              })
              .catch(() => { /* silent: recently viewed is non-critical */ });
          }
        }
      }).catch(() => {});
    }, [])
  );

  return (
    <>
    <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} onHome={() => { setSearchOpen(false); setSearchError(''); setSearchForm({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' }); }} />
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate900, paddingTop: 8 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {user ? `${t('home.hello')} ${user.full_name.split(' ')[0]},\n${t('home.welcome')}` : `${t('home.hello')},\n${t('home.welcome')}`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
              <Text style={styles.langFlag}>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
              <Text style={styles.langCode}>{lang.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(true)}>
              <Ionicons name="home" size={12} color={Colors.orange} />
              <View style={styles.menuLines}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.heroTitle}>{t('home.findIdeal')} <Text style={styles.heroAccent}>{t('home.ideal')}</Text></Text>

        {!searchOpen ? (
          <TouchableOpacity style={styles.searchBar} onPress={() => setSearchOpen(true)}>
            <Ionicons name="search" size={14} color={Colors.slate400} />
            <Text style={styles.searchBarText}>{t('home.searchPlaceholder')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchForm}>
            {/* Acheter / Louer */}
            <View style={styles.toggleRow}>
              {[{ v: '', l: t('common.all') }, { v: 'sale', l: t('home.buy') }, { v: 'rent', l: t('home.rent') }].map(({ v, l }) => (
                <TouchableOpacity key={v} style={[styles.toggleBtn, searchForm.transaction === v && styles.toggleBtnActive]} onPress={() => setSearchForm({ ...searchForm, transaction: v })}>
                  <Text style={[styles.toggleText, searchForm.transaction === v && styles.toggleTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ville */}
            <Dropdown
              icon="location-outline"
              label={t('search.city')}
              value={searchForm.ville}
              placeholder={lang === 'fr' ? 'Choisir' : 'Choose'}
              dark
              options={VILLES.map(v => ({ value: v, label: v }))}
              onSelect={v => setSearchForm({ ...searchForm, ville: v, commune: '', district: '' })}
            />

            {/* Commune */}
            {searchForm.ville === 'Dakar' && (
              <Dropdown
                icon="business-outline"
                label={t('search.commune')}
                value={searchForm.commune}
                placeholder={t('common.all')}
                dark
                options={[{ value: '', label: t('search.allCommunes') }, ...Object.keys(DAKAR_COMMUNES).map(c => ({ value: c, label: c }))]}
                onSelect={v => setSearchForm({ ...searchForm, commune: v, district: '' })}
              />
            )}

            {/* Quartier */}
            {searchForm.commune && DAKAR_COMMUNES[searchForm.commune] && (
              <Dropdown
                icon="navigate-outline"
                label={t('search.neighborhood')}
                value={searchForm.district}
                placeholder={t('common.all')}
                dark
                options={[{ value: '', label: t('search.allNeighborhoods') }, ...DAKAR_COMMUNES[searchForm.commune].map(q => ({ value: q, label: q }))]}
                onSelect={v => setSearchForm({ ...searchForm, district: v })}
              />
            )}

            {/* Type de bien */}
            <Dropdown
              icon="home-outline"
              label="Type"
              value={searchForm.propertyType}
              placeholder={lang === 'fr' ? 'Tout type' : 'All types'}
              dark
              options={PROPERTY_TYPES}
              onSelect={v => setSearchForm({ ...searchForm, propertyType: v })}
            />

            {/* Error */}
            {searchError ? (
              <View style={styles.searchErrorBox}>
                <Ionicons name="alert-circle-outline" size={12} color="#f97316" />
                <Text style={styles.searchErrorText}>{searchError}</Text>
              </View>
            ) : null}

            {/* Active advanced filters indicator */}
            {(advancedFilters.priceMin || advancedFilters.priceMax || advancedFilters.rooms || advancedFilters.bedrooms || advancedFilters.surfaceMin || advancedFilters.surfaceMax || advancedFilters.features.length > 0 || advancedFilters.availability) && (
              <TouchableOpacity style={styles.activeAdvanced} onPress={() => setFiltersModalOpen(true)}>
                <Ionicons name="options-outline" size={12} color={Colors.orange} />
                <Text style={styles.activeAdvancedText}>{t('filters.active')}</Text>
                <TouchableOpacity onPress={() => setAdvancedFilters({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [], availability: '' })}>
                  <Ionicons name="close-circle" size={14} color={Colors.slate400} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Boutons */}
            <View style={styles.searchActions}>
              <TouchableOpacity style={styles.searchCancelBtn} onPress={() => { setSearchOpen(false); setSearchError(''); setSearchForm({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' }); setAdvancedFilters({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [], availability: '' }); }}>
                <Text style={styles.searchCancelText}>{t('common.close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPlusBtn} onPress={() => setFiltersModalOpen(true)}>
                <Ionicons name="options-outline" size={14} color={Colors.orange} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchSubmitBtn} onPress={async () => {
                setSearchError('');
                const searchCity = searchForm.ville;
                const commune = searchForm.commune.includes('-') ? searchForm.commune.split('-').pop() || searchForm.commune : searchForm.commune;
                const searchDistrict = searchForm.district || commune;

                let query = supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published');
                if (searchForm.transaction) query = query.eq('transaction_type', searchForm.transaction);
                if (searchForm.propertyType) query = query.eq('property_type', searchForm.propertyType);
                if (searchCity) query = query.ilike('city', `%${searchCity}%`);
                if (searchDistrict) query = query.ilike('district', `%${searchDistrict}%`);
                if (advancedFilters.priceMin) query = query.gte('price', Number(advancedFilters.priceMin));
                if (advancedFilters.priceMax) query = query.lte('price', Number(advancedFilters.priceMax));
                if (advancedFilters.rooms) query = query.gte('rooms', Number(advancedFilters.rooms));
                if (advancedFilters.bedrooms) query = query.gte('bedrooms', Number(advancedFilters.bedrooms));
                if (advancedFilters.surfaceMin) query = query.gte('surface_area', Number(advancedFilters.surfaceMin));
                if (advancedFilters.surfaceMax) query = query.lte('surface_area', Number(advancedFilters.surfaceMax));
                if (advancedFilters.features.length > 0) query = query.contains('features', advancedFilters.features);
                if (advancedFilters.availability === 'immediate') query = query.eq('availability', 'immediate');

                try {
                  const { count } = await withTimeout(query);

                  if (!count || count === 0) {
                    setSearchError(t('home.noResults'));
                  } else {
                    setSearchOpen(false);
                    setSearchError('');
                    router.push(`/(tabs)/search?type=${searchForm.transaction}&city=${searchCity}&district=${searchDistrict}&property_type=${searchForm.propertyType}` as any);
                  }
                } catch (e: any) {
                  setSearchError(e.message || 'Erreur de connexion');
                }
              }}>
                <Ionicons name="search" size={12} color={Colors.white} />
                <Text style={styles.searchSubmitText}>{t('common.search')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
              {/* Prix */}
              <Text style={styles.filterLabel}>{t('search.price')}</Text>
              <View style={styles.filterRow}>
                <TextInput style={styles.filterInput} placeholder="Min" keyboardType="numeric" value={advancedFilters.priceMin} onChangeText={v => setAdvancedFilters({ ...advancedFilters, priceMin: v })} placeholderTextColor={Colors.slate400} />
                <Text style={styles.filterSep}>-</Text>
                <TextInput style={styles.filterInput} placeholder="Max" keyboardType="numeric" value={advancedFilters.priceMax} onChangeText={v => setAdvancedFilters({ ...advancedFilters, priceMax: v })} placeholderTextColor={Colors.slate400} />
              </View>

              {/* Pieces */}
              <Text style={styles.filterLabel}>{t('search.minRooms')}</Text>
              <View style={styles.filterChipsRow}>
                {['', '1', '2', '3', '4', '5+'].map(v => (
                  <TouchableOpacity key={v} style={[styles.filterChip, advancedFilters.rooms === v && styles.filterChipActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, rooms: advancedFilters.rooms === v ? '' : v })}>
                    <Text style={[styles.filterChipText, advancedFilters.rooms === v && styles.filterChipTextActive]}>{v || t('common.all')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chambres */}
              <Text style={styles.filterLabel}>{t('search.minBedrooms')}</Text>
              <View style={styles.filterChipsRow}>
                {['', '1', '2', '3', '4', '5+'].map(v => (
                  <TouchableOpacity key={v} style={[styles.filterChip, advancedFilters.bedrooms === v && styles.filterChipActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, bedrooms: advancedFilters.bedrooms === v ? '' : v })}>
                    <Text style={[styles.filterChipText, advancedFilters.bedrooms === v && styles.filterChipTextActive]}>{v || t('common.all')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Surface */}
              <Text style={styles.filterLabel}>{t('search.surface')}</Text>
              <View style={styles.filterRow}>
                <TextInput style={styles.filterInput} placeholder="Min" keyboardType="numeric" value={advancedFilters.surfaceMin} onChangeText={v => setAdvancedFilters({ ...advancedFilters, surfaceMin: v })} placeholderTextColor={Colors.slate400} />
                <Text style={styles.filterSep}>-</Text>
                <TextInput style={styles.filterInput} placeholder="Max" keyboardType="numeric" value={advancedFilters.surfaceMax} onChangeText={v => setAdvancedFilters({ ...advancedFilters, surfaceMax: v })} placeholderTextColor={Colors.slate400} />
              </View>

              {/* Caracteristiques */}
              <Text style={styles.filterLabel}>{t('search.features')}</Text>
              <View style={styles.filterFeaturesWrap}>
                {['Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur', 'Balcon', 'Terrasse', 'Gardien', 'Parking', 'Vue mer', 'Meuble', 'Cuisine equipee', 'Titre foncier'].map(f => (
                  <TouchableOpacity key={f} style={[styles.filterFeature, advancedFilters.features.includes(f) && styles.filterFeatureActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, features: advancedFilters.features.includes(f) ? advancedFilters.features.filter(x => x !== f) : [...advancedFilters.features, f] })}>
                    <Text style={[styles.filterFeatureText, advancedFilters.features.includes(f) && styles.filterFeatureTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Disponibilite */}
              <Text style={styles.filterLabel}>Disponibilite</Text>
              <View style={styles.filterChipsRow}>
                {[{ v: '', l: t('availability.all') }, { v: 'immediate', l: t('availability.immediate') }, { v: 'future', l: t('availability.future') }].map(({ v, l }) => (
                  <TouchableOpacity key={v} style={[styles.filterChip, advancedFilters.availability === v && styles.filterChipActive]} onPress={() => setAdvancedFilters({ ...advancedFilters, availability: v })}>
                    <Text style={[styles.filterChipText, advancedFilters.availability === v && styles.filterChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Boutons modal */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalResetBtn} onPress={() => setAdvancedFilters({ priceMin: '', priceMax: '', rooms: '', bedrooms: '', surfaceMin: '', surfaceMax: '', features: [], availability: '' })}>
                <Text style={styles.modalResetText}>{t('common.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={() => setFiltersModalOpen(false)}>
                <Text style={styles.modalApplyText}>{t('common.apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tendances - style SeLoger */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('home.trends')}</Text>
            <Text style={styles.trendDate}>Avril 2026</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {[
            { zone: 'Plateau', appart: 8500, maison: 12000, trendA: 'up', trendM: 'up' },
            { zone: 'Almadies', appart: 12000, maison: 18000, trendA: 'up', trendM: 'stable' },
            { zone: 'Mermoz', appart: 7000, maison: 10000, trendA: 'stable', trendM: 'up' },
            { zone: 'Ngor', appart: 9000, maison: 15000, trendA: 'up', trendM: 'up' },
            { zone: 'Ouakam', appart: 5500, maison: 8000, trendA: 'down', trendM: 'stable' },
            { zone: 'Yoff', appart: 5000, maison: 7500, trendA: 'stable', trendM: 'down' },
            { zone: 'Pikine', appart: 3000, maison: 4500, trendA: 'down', trendM: 'down' },
            { zone: 'Grand Yoff', appart: 4000, maison: 6000, trendA: 'stable', trendM: 'stable' },
            { zone: 'Parcelles', appart: 3500, maison: 5000, trendA: 'up', trendM: 'up' },
          ].map(({ zone, appart, maison, trendA, trendM }) => (
            <View key={zone} style={styles.trendCard}>
              <View style={styles.trendTop}>
                <Text style={styles.trendZone}>{zone}</Text>
                <Text style={styles.trendSub}>Loyer /m²</Text>
              </View>
              <View style={styles.trendPrices}>
                <View style={styles.trendItem}>
                  <Ionicons name="business" size={9} color={Colors.slate400} />
                  <Text style={styles.trendPrice}>{appart.toLocaleString('fr-FR')}</Text>
                  <View style={[styles.trendArrow, trendA === 'up' ? styles.trendArrowUp : trendA === 'down' ? styles.trendArrowDown : styles.trendArrowStable]}>
                    <Ionicons name={trendA === 'up' ? 'arrow-up' : trendA === 'down' ? 'arrow-down' : 'remove'} size={7} color={trendA === 'up' ? '#16a34a' : trendA === 'down' ? '#dc2626' : '#64748b'} />
                  </View>
                </View>
                <View style={styles.trendSep} />
                <View style={styles.trendItem}>
                  <Ionicons name="home" size={9} color={Colors.slate400} />
                  <Text style={styles.trendPrice}>{maison.toLocaleString('fr-FR')}</Text>
                  <View style={[styles.trendArrow, trendM === 'up' ? styles.trendArrowUp : trendM === 'down' ? styles.trendArrowDown : styles.trendArrowStable]}>
                    <Ionicons name={trendM === 'up' ? 'arrow-up' : trendM === 'down' ? 'arrow-down' : 'remove'} size={7} color={trendM === 'up' ? '#16a34a' : trendM === 'down' ? '#dc2626' : '#64748b'} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.featured')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <DataState loading={loading} error={loadError} onRetry={loadHome} compact>
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
                    <Text style={styles.cardBadgeText}>{p.transaction_type === 'sale' ? t('home.sale') : t('home.rental')}</Text>
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
        </DataState>
      </View>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.recentlyViewed')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyViewed.map(p => {
              const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
              return (
                <TouchableOpacity key={p.id} style={styles.recentCard} onPress={() => router.push(`/property/${p.id}`)}>
                  {img ? (
                    <Image source={{ uri: img.url }} style={styles.recentImage} />
                  ) : (
                    <View style={[styles.recentImage, { backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text>🏠</Text>
                    </View>
                  )}
                  <View style={styles.recentContent}>
                    <Text style={styles.recentPrice}>{formatPrice(p.price)}</Text>
                    <Text style={styles.recentTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.recentCity}>{p.city}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* New listings - Prenez contact en premier */}
      {newListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.contactFirst')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newListings.map(p => {
              const img = p.property_images?.find((i: any) => i.is_primary) || p.property_images?.[0];
              return (
                <TouchableOpacity key={p.id} style={styles.newCard} onPress={() => router.push(`/property/${p.id}`)}>
                  {img ? (
                    <Image source={{ uri: img.url }} style={styles.newImage} />
                  ) : (
                    <View style={[styles.newImage, { backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 20 }}>🏠</Text>
                    </View>
                  )}
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{t('home.new')}</Text>
                  </View>
                  <View style={styles.newContent}>
                    <Text style={styles.newPrice}>{formatPrice(p.price)}{p.transaction_type === 'rent' ? '/mois' : ''}</Text>
                    <Text style={styles.newTitle} numberOfLines={1}>{p.title}</Text>
                    <View style={styles.newLocation}>
                      <Ionicons name="location-outline" size={9} color={Colors.slate400} />
                      <Text style={styles.newCity}>{p.district ? `${p.district}, ` : ''}{p.city}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Quick access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.explore')}</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: 'business-outline', label: t('home.apartments'), type: 'apartment' },
            { icon: 'home-outline', label: t('home.houses'), type: 'house' },
            { icon: 'leaf-outline', label: t('home.villas'), type: 'villa' },
            { icon: 'map-outline', label: t('home.lands'), type: 'land' },
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

      {/* Estimation */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.estimateCard} onPress={() => router.push('/estimate')}>
          <View style={styles.estimateLeft}>
            <View style={styles.estimateIcon}>
              <Ionicons name="calculator-outline" size={22} color={Colors.orange} />
            </View>
          </View>
          <View style={styles.estimateContent}>
            <Text style={styles.estimateTitle}>{t('home.estimateTitle')}</Text>
            <Text style={styles.estimateDesc}>{t('home.estimateDesc')}</Text>
            <View style={styles.estimateBtn}>
              <Text style={styles.estimateBtnText}>{t('home.estimateBtn')}</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.orange} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  hero: { backgroundColor: Colors.slate900, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { flex: 1, fontSize: 14, color: Colors.orange, fontWeight: '500', lineHeight: 19 },
  langBtn: { flexDirection: 'row', height: 34, paddingHorizontal: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 4 },
  langFlag: { fontSize: 16 },
  langCode: { fontSize: 11, fontWeight: '600', color: Colors.slate400 },
  menuBtn: { flexDirection: 'row', height: 34, paddingHorizontal: 8, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.12)', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.35)', gap: 6 },
  menuLines: { gap: 3, width: 12 },
  menuLine: { height: 1.5, backgroundColor: Colors.orange, borderRadius: 1, width: '100%' },
  heroTitle: { fontSize: 19, fontWeight: '600', color: Colors.slate300, marginBottom: 12 },
  heroAccent: { color: Colors.orange },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, gap: 8 },
  searchBarText: { fontSize: 14, color: Colors.slate400 },
  searchForm: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12, gap: 6 },
  toggleRow: { flexDirection: 'row', gap: 3, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 },
  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  toggleText: { fontSize: 13, fontWeight: '500', color: Colors.slate500 },
  toggleTextActive: { color: Colors.white, fontWeight: '600' },
  searchErrorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  searchErrorText: { fontSize: 13, color: Colors.orange, flex: 1 },
  searchActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  searchCancelBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  searchCancelText: { fontSize: 12, fontWeight: '500', color: Colors.slate400 },
  searchSubmitBtn: { flex: 2, flexDirection: 'row', paddingVertical: 9, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.orange, gap: 4 },
  searchSubmitText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  section: { marginTop: 36, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900 },
  seeAll: { fontSize: 14, color: Colors.orange, fontWeight: '600' },
  card: { width: width * 0.65, marginRight: 12, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  cardImage: { width: '100%', height: 130, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  cardBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.green + 'dd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  cardContent: { padding: 10 },
  cardPrice: { fontSize: 17, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.slate900, marginTop: 3 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  cardCity: { fontSize: 13, color: Colors.slate400 },
  cardFeatures: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cardFeature: { fontSize: 13, color: Colors.slate500 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '500', color: Colors.slate600, marginTop: 6 },
  trendDate: { fontSize: 13, color: Colors.slate400, marginTop: 2 },
  trendCard: { width: 200, marginRight: 10, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.slate100 },
  trendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendZone: { fontSize: 15, fontWeight: '700', color: Colors.slate900 },
  trendSub: { fontSize: 11, color: Colors.slate400 },
  trendPrices: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  trendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  trendSep: { width: 1, height: 14, backgroundColor: Colors.slate200, marginHorizontal: 6 },
  trendPrice: { fontSize: 13, fontWeight: '700', color: Colors.slate800 },
  trendArrow: { width: 15, height: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  trendArrowUp: { backgroundColor: '#dcfce7' },
  trendArrowDown: { backgroundColor: '#fee2e2' },
  trendArrowStable: { backgroundColor: Colors.slate100 },
  newCard: { width: 155, marginRight: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  newImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  newBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#ef4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  newBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  newContent: { padding: 8 },
  newPrice: { fontSize: 15, fontWeight: '800', color: Colors.orange },
  newTitle: { fontSize: 13, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  newLocation: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  newCity: { fontSize: 12, color: Colors.slate400 },
  recentCard: { width: 140, marginRight: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  recentImage: { width: '100%', height: 80, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  recentContent: { padding: 8 },
  recentPrice: { fontSize: 15, fontWeight: '800', color: Colors.orange },
  recentTitle: { fontSize: 13, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  recentCity: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  estimateCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.slate100, gap: 12 },
  estimateLeft: { justifyContent: 'center' },
  estimateIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  estimateContent: { flex: 1 },
  estimateTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900 },
  estimateDesc: { fontSize: 13, color: Colors.slate500, marginTop: 3, lineHeight: 18 },
  estimateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  estimateBtnText: { fontSize: 14, fontWeight: '600', color: Colors.orange },

  // Advanced filters button
  filterPlusBtn: { width: 40, paddingVertical: 9, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', backgroundColor: 'rgba(249,115,22,0.08)' },
  activeAdvanced: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  activeAdvancedText: { flex: 1, fontSize: 12, color: Colors.orange, fontWeight: '500' },

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
  filterLabel: { fontSize: 13, fontWeight: '700', color: Colors.slate700, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterInput: { flex: 1, borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },
  filterSep: { fontSize: 16, color: Colors.slate400 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: Colors.slate100 },
  filterChipActive: { backgroundColor: Colors.orange },
  filterChipText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  filterChipTextActive: { color: Colors.white },
  filterFeaturesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterFeature: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.slate100 },
  filterFeatureActive: { backgroundColor: Colors.orange },
  filterFeatureText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  filterFeatureTextActive: { color: Colors.white },
});
