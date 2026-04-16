import { useState } from 'react';
import { View, Text, FlatList, ScrollView, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';
import { useAsyncData, withTimeout } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

const TYPES = ['all', 'CDI', 'CDD', 'Freelance', 'Stage'];

export default function CareersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [type, setType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', city: '', type: 'CDI', experience: '', salary: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const { loading, error, refetch } = useAsyncData<any[]>(async () => {
    const { data, error: err } = await supabase.from('jobs').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if (err) throw err;
    const list = data || [];
    setJobs(list);
    return list;
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.city || !form.description) { Alert.alert('Erreur', 'Remplissez les champs obligatoires'); return; }
    setSubmitting(true);
    try {
      const { data, error: err } = await withTimeout(supabase.from('jobs').insert({ ...form, status: 'active', tags: [] }).select().single());
      if (err) throw err;
      if (data) setJobs([data, ...jobs]);
      setShowForm(false);
      setForm({ title: '', company: '', city: '', type: 'CDI', experience: '', salary: '', description: '' });
      Alert.alert('Publie !', 'Votre offre est en ligne.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = type === 'all' ? jobs : jobs.filter(j => j.type === type);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Carrieres</Text>
        {user ? (
          <TouchableOpacity onPress={() => setShowForm(!showForm)}><Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={22} color={Colors.orange} /></TouchableOpacity>
        ) : <View style={{ width: 22 }} />}
      </View>

      {showForm ? (
        <ScrollView style={{ backgroundColor: Colors.white }} contentContainerStyle={{ padding: 14 }}>
          <Text style={styles.formTitle}>Publier une offre d&apos;emploi</Text>
          <TextInput placeholder="Titre du poste *" value={form.title} onChangeText={v => setForm({ ...form, title: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Entreprise *" value={form.company} onChangeText={v => setForm({ ...form, company: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Ville *" value={form.city} onChangeText={v => setForm({ ...form, city: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <View style={styles.typeRow}>
            {['CDI', 'CDD', 'Freelance', 'Stage'].map(t => (
              <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && styles.typeChipActive]} onPress={() => setForm({ ...form, type: t })}>
                <Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Experience" value={form.experience} onChangeText={v => setForm({ ...form, experience: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Salaire" value={form.salary} onChangeText={v => setForm({ ...form, salary: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
          <TextInput placeholder="Description *" value={form.description} onChangeText={v => setForm({ ...form, description: v })} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholderTextColor={Colors.slate400} />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'Publication...' : 'Publier'}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <View style={styles.filterWrap}>
            {TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.filterChip, type === t && styles.filterChipActive]} onPress={() => setType(t)}>
                <Text style={[styles.filterText, type === t && styles.filterTextActive]}>{t === 'all' ? 'Tous' : t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DataState loading={loading} error={error} onRetry={refetch} compact>
            <FlatList data={filtered} contentContainerStyle={{ padding: 14 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.badge}><Text style={styles.badgeText}>{item.type}</Text></View>
                  </View>
                  <Text style={styles.cardCompany}>{item.company}</Text>
                  <Text style={styles.cardCity}>{item.city}{item.experience ? ` - ${item.experience}` : ''}</Text>
                  {item.salary && <Text style={styles.cardSalary}>{item.salary}</Text>}
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                </View>
              )}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.empty}>Aucune offre</Text>}
            />
          </DataState>

          {!user && (
            <View style={styles.ctaBar}>
              <Text style={styles.ctaText}>Connectez-vous pour publier une offre</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/auth/login')}><Text style={styles.ctaBtnText}>Se connecter</Text></TouchableOpacity>
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
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.slate100 },
  typeChipActive: { backgroundColor: Colors.orange },
  typeText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  typeTextActive: { color: Colors.white },
  submitBtn: { backgroundColor: Colors.orange, paddingVertical: 11, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: Colors.slate100 },
  filterChipActive: { backgroundColor: Colors.orange },
  filterText: { fontSize: 12, fontWeight: '500', color: Colors.slate600 },
  filterTextActive: { color: Colors.white },
  card: { backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.slate900, flex: 1 },
  badge: { backgroundColor: Colors.orangeLight + '30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.orange },
  cardCompany: { fontSize: 13, color: Colors.orange, marginTop: 3 },
  cardCity: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  cardSalary: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginTop: 3 },
  cardDesc: { fontSize: 13, color: Colors.slate500, marginTop: 4, lineHeight: 17 },
  empty: { textAlign: 'center', color: Colors.slate400, marginTop: 40, fontSize: 14 },
  ctaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  ctaText: { fontSize: 13, color: Colors.slate500, flex: 1 },
  ctaBtn: { backgroundColor: Colors.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  ctaBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
});
