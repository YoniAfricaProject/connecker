import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TektalRecorder } from '../../components/tektal-recorder';
import { useAuth } from '../../lib/auth-context';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { withTimeout } from '../../lib/use-async-data';
import { Dropdown } from '../../components/dropdown';
import { VILLES, DAKAR_COMMUNES, PROPERTY_TYPES } from '../../lib/dakar-data';
import { Colors } from '../../lib/colors';

const FEATURES = ['Piscine', 'Jardin', 'Garage', 'Climatisation', 'Ascenseur', 'Balcon', 'Terrasse', 'Gardien', 'Parking', 'Vue mer', 'Meuble', 'Wifi', 'Cuisine equipee', 'Titre foncier'];

export default function PublishTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [tektalUri, setTektalUri] = useState('');
  const [tektalDuration, setTektalDuration] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', transaction_type: 'sale', property_type: 'apartment',
    price: '', surface_area: '', rooms: '', bedrooms: '', bathrooms: '',
    ville: 'Dakar', commune: '', district: '', address: '',
    features: [] as string[],
  });

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={36} color={Colors.slate300} />
        <Text style={styles.centerTitle}>{t('auth.connectRequired')}</Text>
        <Text style={styles.centerSub}>{t('publish.connectRequired')}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryBtnText}>{t('auth.signIn')}</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
        <Text style={styles.centerTitle}>{t('publish.successTitle')}</Text>
        <Text style={styles.centerSub}>{t('publish.successSub')}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => { setSuccess(false); setStep(1); setForm({ title: '', description: '', transaction_type: 'sale', property_type: 'apartment', price: '', surface_area: '', rooms: '', bedrooms: '', bathrooms: '', ville: 'Dakar', commune: '', district: '', address: '', features: [] }); setImages([]); }}>
          <Text style={styles.primaryBtnText}>{t('publish.publishAnother')}</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => ({ uri: a.uri }))]);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.address) {
      Alert.alert('Erreur', t('publish.requiredFields'));
      return;
    }
    setSubmitting(true);
    try {
      const city = form.ville;
      const district = form.district || form.commune.replace(/^.*-/, '');

      const { data: property, error } = await withTimeout(supabase.from('properties').insert({
        title: form.title,
        description: form.description,
        transaction_type: form.transaction_type,
        property_type: form.property_type,
        price: Number(form.price),
        currency: 'XOF',
        surface_area: form.surface_area ? Number(form.surface_area) : null,
        rooms: form.rooms ? Number(form.rooms) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        address: form.address,
        city,
        district: district || null,
        country: 'SN',
        features: form.features,
        announcer_id: user.id,
        status: 'pending',
      }).select().single(), 15000);

      if (error) throw error;

      if (property && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const path = `${property.id}/${Date.now()}-${i}.jpg`;
          const formData = new FormData();
          formData.append('file', { uri: img.uri, name: `photo-${i}.jpg`, type: 'image/jpeg' } as any);

          const { error: uploadError } = await withTimeout(supabase.storage
            .from('property-images')
            .upload(path, formData as any, { contentType: 'image/jpeg', upsert: false }), 20000);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path);
          await withTimeout(supabase.from('property_images').insert({ property_id: property.id, url: publicUrl, is_primary: i === 0, sort_order: i }));
        }
      }

      if (property && tektalUri) {
        const tektalPath = `tektal/${property.id}.m4a`;
        const formData = new FormData();
        formData.append('file', { uri: tektalUri, name: 'tektal.m4a', type: 'audio/m4a' } as any);

        await withTimeout(supabase.storage
          .from('property-images')
          .upload(tektalPath, formData as any, { contentType: 'audio/m4a', upsert: true }), 20000)
          .catch(() => {});
      }

      setSuccess(true);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || t('publish.publishError'));
    }
    setSubmitting(false);
  };

  const commune = form.commune;
  const quartiers = commune && DAKAR_COMMUNES[commune] ? DAKAR_COMMUNES[commune] : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{t('publish.title')}</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.slate400} />
      </TouchableOpacity>
    </View>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        {[1, 2, 3].map(s => (
          <TouchableOpacity key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} onPress={() => setStep(s)}>
            <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.stepLine} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>{t('publish.information')}</Text>

            <Text style={styles.label}>{t('publish.titleField')}</Text>
            <TextInput value={form.title} onChangeText={v => setForm({ ...form, title: v })} style={styles.input} placeholder={t('publish.titlePlaceholder')} placeholderTextColor={Colors.slate400} />

            <Text style={styles.label}>{t('publish.transactionType')}</Text>
            <View style={styles.toggleRow}>
              {[{ v: 'sale', l: t('home.sale') }, { v: 'rent', l: t('home.rental') }].map(({ v, l }) => (
                <TouchableOpacity key={v} style={[styles.toggleBtn, form.transaction_type === v && styles.toggleActive]} onPress={() => setForm({ ...form, transaction_type: v })}>
                  <Text style={[styles.toggleText, form.transaction_type === v && styles.toggleTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 16 }}>
              <Dropdown icon="home-outline" label="Type" value={form.property_type} placeholder="Choisir" options={PROPERTY_TYPES.filter(t => t.value)} onSelect={v => setForm({ ...form, property_type: v })} />
            </View>

            <Text style={styles.label}>{t('publish.price')}</Text>
            <TextInput value={form.price} onChangeText={v => setForm({ ...form, price: v })} style={styles.input} placeholder="Ex: 50000000" keyboardType="numeric" placeholderTextColor={Colors.slate400} />

            <Text style={styles.label}>{t('publish.description')}</Text>
            <TextInput value={form.description} onChangeText={v => setForm({ ...form, description: v })} style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder={t('publish.descriptionPlaceholder')} multiline placeholderTextColor={Colors.slate400} />

            <View style={{ marginTop: 32 }}>
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
                <Text style={styles.nextBtnText}>{t('common.next')}</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>{t('publish.locationDetails')}</Text>

            <Dropdown icon="location-outline" label="Ville" value={form.ville} placeholder="Choisir" options={VILLES.map(v => ({ value: v, label: v }))} onSelect={v => setForm({ ...form, ville: v, commune: '', district: '' })} />

            {form.ville === 'Dakar' && (
              <View style={{ marginTop: 12 }}>
                <Dropdown icon="business-outline" label="Commune" value={form.commune} placeholder="Toutes" options={[{ value: '', label: 'Toutes' }, ...Object.keys(DAKAR_COMMUNES).map(c => ({ value: c, label: c }))]} onSelect={v => setForm({ ...form, commune: v, district: '' })} />
              </View>
            )}

            {quartiers.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Dropdown icon="navigate-outline" label="Quartier" value={form.district} placeholder="Tous" options={[{ value: '', label: 'Tous' }, ...quartiers.map(q => ({ value: q, label: q }))]} onSelect={v => setForm({ ...form, district: v })} />
              </View>
            )}

            <Text style={styles.label}>{t('publish.address')}</Text>
            <TextInput value={form.address} onChangeText={v => setForm({ ...form, address: v })} style={styles.input} placeholder="Rue, numero..." placeholderTextColor={Colors.slate400} />

            {/* Tektal - description vocale */}
            <TektalRecorder
              label="Tektal - Description vocale"
              onRecorded={(uri, dur) => { setTektalUri(uri); setTektalDuration(dur); }}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}><Text style={styles.label}>{t('publish.surface')}</Text><TextInput value={form.surface_area} onChangeText={v => setForm({ ...form, surface_area: v })} style={styles.input} keyboardType="numeric" placeholder="120" placeholderTextColor={Colors.slate400} /></View>
              <View style={styles.rowItem}><Text style={styles.label}>{t('publish.rooms')}</Text><TextInput value={form.rooms} onChangeText={v => setForm({ ...form, rooms: v })} style={styles.input} keyboardType="numeric" placeholder="4" placeholderTextColor={Colors.slate400} /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.rowItem}><Text style={styles.label}>{t('publish.bedrooms')}</Text><TextInput value={form.bedrooms} onChangeText={v => setForm({ ...form, bedrooms: v })} style={styles.input} keyboardType="numeric" placeholder="3" placeholderTextColor={Colors.slate400} /></View>
              <View style={styles.rowItem}><Text style={styles.label}>{t('publish.bathrooms')}</Text><TextInput value={form.bathrooms} onChangeText={v => setForm({ ...form, bathrooms: v })} style={styles.input} keyboardType="numeric" placeholder="2" placeholderTextColor={Colors.slate400} /></View>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}><Text style={styles.backBtnText}>{t('common.back')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}><Text style={styles.nextBtnText}>{t('common.next')}</Text><Ionicons name="arrow-forward" size={14} color={Colors.white} /></TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>{t('publish.photosEquipment')}</Text>

            <Text style={styles.label}>{t('publish.photos')}</Text>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImages}>
              <Ionicons name="camera-outline" size={20} color={Colors.orange} />
              <Text style={styles.photoBtnText}>{t('publish.addPhotos')}</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {images.map((img, i) => (
                  <View key={i} style={styles.photoPreview}>
                    <Image source={{ uri: img.uri }} style={styles.photoImg} />
                    {i === 0 && <View style={styles.photoBadge}><Text style={styles.photoBadgeText}>1ere</Text></View>}
                    <TouchableOpacity style={styles.photoRemove} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                      <Ionicons name="close" size={10} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>{t('publish.equipment')}</Text>
            <View style={styles.featuresWrap}>
              {FEATURES.map(f => (
                <TouchableOpacity key={f} style={[styles.featureChip, form.features.includes(f) && styles.featureChipActive]} onPress={() => setForm({ ...form, features: form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f] })}>
                  <Text style={[styles.featureText, form.features.includes(f) && styles.featureTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}><Text style={styles.backBtnText}>{t('common.back')}</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.nextBtn, { flex: 2 }]} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color={Colors.white} size="small" /> : <><Ionicons name="checkmark-circle" size={14} color={Colors.white} /><Text style={styles.nextBtnText}>{t('common.publish')}</Text></>}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.slate900 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  centerTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900, marginTop: 12 },
  centerSub: { fontSize: 13, color: Colors.slate500, textAlign: 'center', marginTop: 4 },
  primaryBtn: { backgroundColor: Colors.orange, paddingVertical: 11, paddingHorizontal: 24, borderRadius: 10, marginTop: 16 },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },

  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 8, paddingBottom: 4, position: 'relative' },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stepDotActive: { backgroundColor: Colors.orange },
  stepText: { fontSize: 13, fontWeight: '600', color: Colors.slate400 },
  stepTextActive: { color: Colors.white },
  stepLine: { position: 'absolute', height: 2, backgroundColor: Colors.slate100, left: '25%', right: '25%', top: 20, zIndex: 1 },

  stepTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate900, marginBottom: 8, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.slate500, marginBottom: 8, marginTop: 22, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },

  toggleRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.slate100 },
  toggleActive: { backgroundColor: Colors.orange },
  toggleText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  toggleTextActive: { color: Colors.white, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rowItem: { flex: 1 },

  photoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.slate200, borderRadius: 12, paddingVertical: 20 },
  photoBtnText: { fontSize: 14, fontWeight: '500', color: Colors.slate500 },
  photoPreview: { width: 70, height: 70, borderRadius: 10, marginRight: 8, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  photoBadge: { position: 'absolute', top: 3, left: 3, backgroundColor: Colors.orange, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  photoBadgeText: { fontSize: 7, fontWeight: '700', color: Colors.white },
  photoRemove: { position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  featuresWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 7, backgroundColor: Colors.slate100 },
  featureChipActive: { backgroundColor: Colors.orange },
  featureText: { fontSize: 12, fontWeight: '500', color: Colors.slate600 },
  featureTextActive: { color: Colors.white },

  navRow: { flexDirection: 'row', gap: 8, marginTop: 32 },
  backBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.slate200 },
  backBtnText: { fontSize: 14, fontWeight: '500', color: Colors.slate600 },
  nextBtn: { flex: 1, flexDirection: 'row', paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.orange, gap: 5 },
  nextBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
