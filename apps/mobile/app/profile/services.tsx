import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';
import { useAsyncData } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

export default function ServicesPage() {
  const router = useRouter();
  const { data: services, loading, error, refetch } = useAsyncData<any[]>(async () => {
    const { data, error: err } = await supabase.from('services').select('*').eq('status', 'active').order('verified', { ascending: false });
    if (err) throw err;
    return data || [];
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Outils & services</Text>
        <View style={{ width: 20 }} />
      </View>

      <DataState loading={loading} error={error} onRetry={refetch} compact>
      {(services || []).length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="build-outline" size={36} color={Colors.slate200} />
          <Text style={styles.emptyTitle}>Bientot disponible</Text>
          <Text style={styles.emptySub}>L&apos;annuaire des professionnels arrive bientot</Text>
        </View>
      ) : (
        <FlatList
          data={services || []}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceInitial}>{item.name?.charAt(0)}</Text>
              </View>
              <View style={styles.serviceContent}>
                <View style={styles.serviceTop}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  {item.verified && <Ionicons name="checkmark-circle" size={12} color="#3b82f6" />}
                </View>
                <Text style={styles.serviceCategory}>{item.category}</Text>
                {item.city && <Text style={styles.serviceCity}>{item.district ? `${item.district}, ` : ''}{item.city}</Text>}
              </View>
              {item.phone && (
                <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <Ionicons name="call-outline" size={14} color={Colors.orange} />
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={item => item.id}
        />
      )}
      </DataState>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate900 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.slate900, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.slate400, marginTop: 4 },
  serviceCard: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 8, gap: 10, alignItems: 'center' },
  serviceIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  serviceInitial: { fontSize: 17, fontWeight: '700', color: Colors.orange },
  serviceContent: { flex: 1 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceName: { fontSize: 15, fontWeight: '600', color: Colors.slate900 },
  serviceCategory: { fontSize: 13, color: Colors.orange, marginTop: 1 },
  serviceCity: { fontSize: 12, color: Colors.slate400, marginTop: 1 },
  callBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: Colors.orange + '30', justifyContent: 'center', alignItems: 'center' },
});
