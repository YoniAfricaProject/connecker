import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { SideMenu } from '../../components/side-menu';
import { Dropdown } from '../../components/dropdown';
import { VILLES, DAKAR_COMMUNES, PROPERTY_TYPES } from '../../lib/dakar-data';
import { Colors } from '../../lib/colors';

const { width } = Dimensions.get('window');

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function HomeTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' });
  const [searchError, setSearchError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [newListings, setNewListings] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('views_count', { ascending: false }).limit(6),
      supabase.from('properties').select('*, property_images(*)').eq('status', 'published').order('created_at', { ascending: false }).limit(4),
    ]).then(([{ data: featured }, { data: newest }]) => {
      setProperties(featured || []);
      setNewListings(newest || []);
      setLoading(false);
    });

  }, []);

  // Reload recently viewed every time tab gets focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('recently_viewed').then(val => {
        if (val) {
          const ids = JSON.parse(val) as string[];
          if (ids.length > 0) {
            supabase.from('properties').select('*, property_images(*)').in('id', ids).limit(6)
              .then(({ data }) => {
                if (data) {
                  const sorted = ids.map(rid => data.find((p: any) => p.id === rid)).filter(Boolean);
                  setRecentlyViewed(sorted);
                }
              });
          }
        }
      });
    }, [])
  );

  return (
    <>
    <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} onHome={() => { setSearchOpen(false); setSearchError(''); setSearchForm({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' }); }} />
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {user ? `Bonjour ${user.full_name.split(' ')[0]},\nbienvenue !` : 'Bonjour,\nbienvenue !'}
          </Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(true)}>
            <Ionicons name="home" size={12} color={Colors.orange} />
            <View style={styles.menuLines}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroTitle}>Trouvez le bien <Text style={styles.heroAccent}>ideal</Text></Text>

        {!searchOpen ? (
          <TouchableOpacity style={styles.searchBar} onPress={() => setSearchOpen(true)}>
            <Ionicons name="search" size={14} color={Colors.slate400} />
            <Text style={styles.searchBarText}>Dakar, Thies, Saint-Louis...</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchForm}>
            {/* Acheter / Louer */}
            <View style={styles.toggleRow}>
              {[{ v: '', l: 'Tous' }, { v: 'sale', l: 'Acheter' }, { v: 'rent', l: 'Louer' }].map(({ v, l }) => (
                <TouchableOpacity key={v} style={[styles.toggleBtn, searchForm.transaction === v && styles.toggleBtnActive]} onPress={() => setSearchForm({ ...searchForm, transaction: v })}>
                  <Text style={[styles.toggleText, searchForm.transaction === v && styles.toggleTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ville */}
            <Dropdown
              icon="location-outline"
              label="Ville"
              value={searchForm.ville}
              placeholder="Choisir"
              dark
              options={VILLES.map(v => ({ value: v, label: v }))}
              onSelect={v => setSearchForm({ ...searchForm, ville: v, commune: '', district: '' })}
            />

            {/* Commune */}
            {searchForm.ville === 'Dakar' && (
              <Dropdown
                icon="business-outline"
                label="Commune"
                value={searchForm.commune}
                placeholder="Toutes"
                dark
                options={[{ value: '', label: 'Toutes les communes' }, ...Object.keys(DAKAR_COMMUNES).map(c => ({ value: c, label: c }))]}
                onSelect={v => setSearchForm({ ...searchForm, commune: v, district: '' })}
              />
            )}

            {/* Quartier */}
            {searchForm.commune && DAKAR_COMMUNES[searchForm.commune] && (
              <Dropdown
                icon="navigate-outline"
                label="Quartier"
                value={searchForm.district}
                placeholder="Tous"
                dark
                options={[{ value: '', label: 'Tous les quartiers' }, ...DAKAR_COMMUNES[searchForm.commune].map(q => ({ value: q, label: q }))]}
                onSelect={v => setSearchForm({ ...searchForm, district: v })}
              />
            )}

            {/* Type de bien */}
            <Dropdown
              icon="home-outline"
              label="Type"
              value={searchForm.propertyType}
              placeholder="Tout type"
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

            {/* Boutons */}
            <View style={styles.searchActions}>
              <TouchableOpacity style={styles.searchCancelBtn} onPress={() => { setSearchOpen(false); setSearchError(''); setSearchForm({ transaction: '', ville: 'Dakar', commune: '', district: '', propertyType: '' }); }}>
                <Text style={styles.searchCancelText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchSubmitBtn} onPress={async () => {
                setSearchError('');
                // city = la ville, district = commune ou quartier choisi
                const searchCity = searchForm.ville;
                // Remove city prefix from commune name (e.g. "Dakar-Plateau" -> "Plateau")
                const commune = searchForm.commune.includes('-') ? searchForm.commune.split('-').pop() || searchForm.commune : searchForm.commune;
                const searchDistrict = searchForm.district || commune;

                let query = supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published');
                if (searchForm.transaction) query = query.eq('transaction_type', searchForm.transaction);
                if (searchForm.propertyType) query = query.eq('property_type', searchForm.propertyType);
                if (searchCity) query = query.ilike('city', `%${searchCity}%`);
                if (searchDistrict) query = query.ilike('district', `%${searchDistrict}%`);

                const { count } = await query;

                if (!count || count === 0) {
                  setSearchError('Aucun bien trouve. Modifiez vos criteres.');
                } else {
                  setSearchOpen(false);
                  setSearchError('');
                  router.push(`/(tabs)/search?type=${searchForm.transaction}&city=${searchCity}&district=${searchDistrict}&property_type=${searchForm.propertyType}` as any);
                }
              }}>
                <Ionicons name="search" size={12} color={Colors.white} />
                <Text style={styles.searchSubmitText}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Tendances - style SeLoger */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Vos tendances immo</Text>
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

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recemment consultes</Text>
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
            <Text style={styles.sectionTitle}>Prenez contact en premier</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
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
                    <Text style={styles.newBadgeText}>Nouveau</Text>
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

      {/* Estimation */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.estimateCard} onPress={() => router.push('/estimate')}>
          <View style={styles.estimateLeft}>
            <View style={styles.estimateIcon}>
              <Ionicons name="calculator-outline" size={22} color={Colors.orange} />
            </View>
          </View>
          <View style={styles.estimateContent}>
            <Text style={styles.estimateTitle}>Estimez votre bien</Text>
            <Text style={styles.estimateDesc}>Obtenez une estimation gratuite basee sur les prix du marche dans votre quartier</Text>
            <View style={styles.estimateBtn}>
              <Text style={styles.estimateBtnText}>Estimer maintenant</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.orange} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  hero: { backgroundColor: Colors.slate900, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { flex: 1, fontSize: 11, color: Colors.orange, fontWeight: '500', lineHeight: 16 },
  menuBtn: { flexDirection: 'row', height: 34, paddingHorizontal: 8, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.12)', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.35)', gap: 6 },
  menuLines: { gap: 3, width: 12 },
  menuLine: { height: 1.5, backgroundColor: Colors.orange, borderRadius: 1, width: '100%' },
  heroTitle: { fontSize: 16, fontWeight: '600', color: Colors.slate300, marginBottom: 12 },
  heroAccent: { color: Colors.orange },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, gap: 8 },
  searchBarText: { fontSize: 11, color: Colors.slate400 },
  searchForm: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12, gap: 6 },
  toggleRow: { flexDirection: 'row', gap: 3, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 },
  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  toggleText: { fontSize: 10, fontWeight: '500', color: Colors.slate500 },
  toggleTextActive: { color: Colors.white, fontWeight: '600' },
  searchErrorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  searchErrorText: { fontSize: 10, color: Colors.orange, flex: 1 },
  searchActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  searchCancelBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  searchCancelText: { fontSize: 9, fontWeight: '500', color: Colors.slate400 },
  searchSubmitBtn: { flex: 2, flexDirection: 'row', paddingVertical: 9, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.orange, gap: 4 },
  searchSubmitText: { fontSize: 10, fontWeight: '600', color: Colors.white },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.slate900 },
  seeAll: { fontSize: 11, color: Colors.orange, fontWeight: '600' },
  card: { width: width * 0.65, marginRight: 12, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  cardImage: { width: '100%', height: 130, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  cardBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.green + 'dd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.white },
  cardContent: { padding: 10 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: Colors.orange },
  cardTitle: { fontSize: 12, fontWeight: '600', color: Colors.slate900, marginTop: 3 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  cardCity: { fontSize: 10, color: Colors.slate400 },
  cardFeatures: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cardFeature: { fontSize: 10, color: Colors.slate500 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '500', color: Colors.slate600, marginTop: 6 },
  trendDate: { fontSize: 10, color: Colors.slate400, marginTop: 2 },
  trendCard: { width: 200, marginRight: 10, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.slate100 },
  trendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendZone: { fontSize: 12, fontWeight: '700', color: Colors.slate900 },
  trendSub: { fontSize: 8, color: Colors.slate400 },
  trendPrices: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  trendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  trendSep: { width: 1, height: 14, backgroundColor: Colors.slate200, marginHorizontal: 6 },
  trendPrice: { fontSize: 10, fontWeight: '700', color: Colors.slate800 },
  trendArrow: { width: 15, height: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  trendArrowUp: { backgroundColor: '#dcfce7' },
  trendArrowDown: { backgroundColor: '#fee2e2' },
  trendArrowStable: { backgroundColor: Colors.slate100 },
  newCard: { width: 155, marginRight: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  newImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  newBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#ef4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  newBadgeText: { fontSize: 8, fontWeight: '700', color: Colors.white },
  newContent: { padding: 8 },
  newPrice: { fontSize: 12, fontWeight: '800', color: Colors.orange },
  newTitle: { fontSize: 10, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  newLocation: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  newCity: { fontSize: 9, color: Colors.slate400 },
  recentCard: { width: 140, marginRight: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100, overflow: 'hidden' },
  recentImage: { width: '100%', height: 80, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  recentContent: { padding: 8 },
  recentPrice: { fontSize: 12, fontWeight: '800', color: Colors.orange },
  recentTitle: { fontSize: 10, fontWeight: '600', color: Colors.slate900, marginTop: 2 },
  recentCity: { fontSize: 9, color: Colors.slate400, marginTop: 2 },
  estimateCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.slate100, gap: 12 },
  estimateLeft: { justifyContent: 'center' },
  estimateIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  estimateContent: { flex: 1 },
  estimateTitle: { fontSize: 13, fontWeight: '700', color: Colors.slate900 },
  estimateDesc: { fontSize: 10, color: Colors.slate500, marginTop: 3, lineHeight: 15 },
  estimateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  estimateBtnText: { fontSize: 11, fontWeight: '600', color: Colors.orange },
});
