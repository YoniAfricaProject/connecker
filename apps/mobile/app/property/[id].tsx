import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

const { width } = Dimensions.get('window');

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    supabase.from('properties').select('*, property_images(*), users!announcer_id(*)').eq('id', id).single()
      .then(({ data }) => { setProperty(data); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from('favorites').select('id').eq('user_id', user.id).eq('property_id', id as string).single()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user || !property) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', property.id);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, property_id: property.id });
    }
    setIsFavorite(!isFavorite);
  };

  const openWhatsApp = () => {
    const phone = property?.users?.phone?.replace(/\s/g, '').replace('+', '') || '';
    const msg = encodeURIComponent(`Bonjour, je suis interesse(e) par "${property?.title}" sur Connec'Ker.`);
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.orange} /></View>;
  if (!property) return <View style={styles.center}><Text>Bien non trouve</Text></View>;

  const images = property.property_images || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {images.map((img: any, i: number) => (
              <Image key={i} source={{ uri: img.url }} style={styles.image} />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.image, { backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 50 }}>🏠</Text>
          </View>
        )}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_: any, i: number) => (
              <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? Colors.red : Colors.slate600} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Price + Badge */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(property.price)}{property.transaction_type === 'rent' ? '/mois' : ''}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{property.transaction_type === 'sale' ? 'Vente' : 'Location'}</Text></View>
        </View>

        <Text style={styles.title}>{property.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.orange} />
          <Text style={styles.location}>{property.district ? `${property.district}, ` : ''}{property.city}</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {property.bedrooms != null && <View style={styles.featureItem}><Ionicons name="bed-outline" size={18} color={Colors.orange} /><Text style={styles.featureText}>{property.bedrooms} ch.</Text></View>}
          {property.bathrooms != null && <View style={styles.featureItem}><Ionicons name="water-outline" size={18} color={Colors.orange} /><Text style={styles.featureText}>{property.bathrooms} sdb</Text></View>}
          {property.surface_area != null && <View style={styles.featureItem}><Ionicons name="resize-outline" size={18} color={Colors.orange} /><Text style={styles.featureText}>{property.surface_area} m²</Text></View>}
          {property.rooms != null && <View style={styles.featureItem}><Ionicons name="grid-outline" size={18} color={Colors.orange} /><Text style={styles.featureText}>{property.rooms} pcs</Text></View>}
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{property.description}</Text>

        {/* Equipements */}
        {property.features?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Equipements</Text>
            <View style={styles.tags}>
              {property.features.map((f: string) => (
                <View key={f} style={styles.tag}><Ionicons name="checkmark" size={12} color={Colors.green} /><Text style={styles.tagText}>{f}</Text></View>
              ))}
            </View>
          </>
        )}

        {/* Contact buttons */}
        <View style={styles.contactSection}>
          {property.users?.phone && (
            <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          {property.users?.phone && (
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${property.users.phone}`)}>
              <Ionicons name="call-outline" size={20} color={Colors.orange} />
              <Text style={styles.callText}>Appeler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  image: { width, height: 280 },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  favBtn: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 24, fontWeight: '800', color: Colors.orange },
  badge: { backgroundColor: Colors.green + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700', color: Colors.green },
  title: { fontSize: 20, fontWeight: '700', color: Colors.slate900, marginTop: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { fontSize: 13, color: Colors.slate500 },
  features: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.slate50, borderRadius: 14, padding: 16, marginTop: 20 },
  featureItem: { alignItems: 'center', gap: 4 },
  featureText: { fontSize: 12, fontWeight: '600', color: Colors.slate700 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900, marginTop: 24, marginBottom: 10 },
  description: { fontSize: 14, color: Colors.slate600, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.slate50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12, color: Colors.slate700 },
  contactSection: { flexDirection: 'row', gap: 12, marginTop: 30, marginBottom: 30 },
  whatsappBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 14 },
  whatsappText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.orange, paddingVertical: 16, borderRadius: 14 },
  callText: { fontSize: 15, fontWeight: '700', color: Colors.orange },
});
