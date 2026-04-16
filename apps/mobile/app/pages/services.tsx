import { useState } from 'react';
import { View, Text, FlatList, ScrollView, TextInput, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';
import { useAsyncData, withTimeout } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

const CATS = ['all', 'Agence', 'Architecte', 'Banque', 'Notaire', 'Promoteur', 'Construction', 'Decorateur', 'Geometre'];

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Agence', phone: '', email: '', city: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const { loading, error, refetch } = useAsyncData<any[]>(async () => {
    const { data, error: err } = await supabase.from('services').select('*').eq('status', 'active').order('verified', { ascending: false });
    if (err) throw err;
    const list = data || [];
    setServices(list);
    return list;
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { Alert.alert('Erreur', 'Nom et telephone requis'); return; }
    setSubmitting(true);
    try {
      const { data, error: err } = await withTimeout(supabase.from('services').insert({ ...form, status: 'active', verified: false }).select().single());
      if (err) throw err;
      if (data) setServices([data, ...services]);
      setShowForm(false);
      setForm({ name: '', category: 'Agence', phone: '', email: '', city: '', description: '' });
      Alert.alert('Publie !', 'Votre service est en ligne. Il sera verifie par notre equipe.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = category === 'all' ? services : services.filter(s => s.category === category);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        {user ? (
          <TouchableOpacity onPress={() => setShowForm(!showForm)}><Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={22} color={Colors.orange} /></TouchableOpacity>
        ) : <View style={{ width: 22 }} />}
      </View>

      {/* Publish form */}
      {showForm && (
        <ScrollView style={styles.formCard} contentContainerStyle={{ padding: 14 }}>
          <Text style={styles.formTitle}>Publier votre service</Text>
          <TextInput placeholder="Nom de votre entreprise *" value={form.name} onChangeText={v => setForm({ ...form, name: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <View style={styles.catRow}>
            {['Agence', 'Architecte', 'Banque', 'Notaire', 'Promoteur', 'Construction'].map(c => (
              <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm({ ...form, category: c })}>
                <Text style={[styles.catText, form.category === c && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Telephone *" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} style={styles.input} keyboardType="phone-pad" placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Email" value={form.email} onChangeText={v => setForm({ ...form, email: v })} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Ville" value={form.city} onChangeText={v => setForm({ ...form, city: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Description" value={form.description} onChangeText={v => setForm({ ...form, description: v })} style={[styles.input, { height: 60, textAlignVertical: 'top' }]} multiline placeholderTextColor={Colors.slate400} />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'Publication...' : 'Publier'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!showForm && (
        <>
          <View style={styles.filterWrap}>
            {CATS.map(c => (
              <TouchableOpacity key={c} style={[styles.filterChip, category === c && styles.filterChipActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.filterText, category === c && styles.filterTextActive]}>{c === 'all' ? 'Tous' : c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DataState loading={loading} error={error} onRetry={refetch} compact>
            <FlatList
              data={filtered}
              contentContainerStyle={{ padding: 14 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardIcon}><Text style={styles.cardInitial}>{item.name?.charAt(0)}</Text></View>
                  <View style={styles.cardContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      {item.verified && <Ionicons name="checkmark-circle" size={11} color="#3b82f6" />}
                    </View>
                    <Text style={styles.cardCat}>{item.category}</Text>
                    {item.city && <Text style={styles.cardCity}>{item.city}</Text>}
                  </View>
                  {item.phone && (
                    <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                      <Ionicons name="call-outline" size={13} color={Colors.orange} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.empty}>{services.length === 0 ? 'Bientot disponible' : 'Aucun resultat'}</Text>}
            />
          </DataState>

          {!user && (
            <View style={styles.ctaBar}>
              <Text style={styles.ctaText}>Connectez-vous pour publier votre service</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/auth/login')}>
                <Text style={styles.ctaBtnText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate900 },
  formCard: { backgroundColor: Colors.white, maxHeight: 400 },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50, marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  catChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.slate100 },
  catChipActive: { backgroundColor: Colors.orange },
  catText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  catTextActive: { color: Colors.white },
  submitBtn: { backgroundColor: Colors.orange, paddingVertical: 11, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  filterChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.slate100 },
  filterChipActive: { backgroundColor: Colors.orange },
  filterText: { fontSize: 12, fontWeight: '500', color: Colors.slate600 },
  filterTextActive: { color: Colors.white },
  card: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 8, gap: 10, alignItems: 'center' },
  cardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  cardInitial: { fontSize: 16, fontWeight: '700', color: Colors.orange },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.slate900 },
  cardCat: { fontSize: 12, color: Colors.orange, marginTop: 1 },
  cardCity: { fontSize: 12, color: Colors.slate400, marginTop: 1 },
  callBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: Colors.orange + '30', justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: Colors.slate400, marginTop: 40, fontSize: 14 },
  ctaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  ctaText: { fontSize: 13, color: Colors.slate500, flex: 1 },
  ctaBtn: { backgroundColor: Colors.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  ctaBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
});
