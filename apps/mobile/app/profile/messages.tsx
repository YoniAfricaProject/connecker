import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';
import { withTimeout } from '../../lib/use-async-data';
import { DataState } from '../../components/data-state';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    withTimeout(
      supabase.from('leads')
        .select('*, properties(title, announcer_id)')
        .or(`sender_email.eq.${user.email},properties.announcer_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20)
    )
      .then(({ data }) => { setLeads(data || []); setLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e : new Error(String(e))); setLoading(false); });
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 20 }} />
      </View>

      <DataState loading={loading} error={error} onRetry={load} compact>
      {leads.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={36} color={Colors.slate200} />
          <Text style={styles.emptyTitle}>Aucun message</Text>
          <Text style={styles.emptySub}>Vos conversations apparaitront ici</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.msgCard}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>{item.sender_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Text>
              </View>
              <View style={styles.msgContent}>
                <View style={styles.msgTop}>
                  <Text style={styles.msgName}>{item.sender_name}</Text>
                  <Text style={styles.msgDate}>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Text style={styles.msgProperty} numberOfLines={1}>Re: {item.properties?.title}</Text>
                <Text style={styles.msgText} numberOfLines={2}>{item.message}</Text>
              </View>
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
  msgCard: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 8, gap: 10 },
  msgAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.orangeLight + '40', justifyContent: 'center', alignItems: 'center' },
  msgAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.orange },
  msgContent: { flex: 1 },
  msgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgName: { fontSize: 15, fontWeight: '600', color: Colors.slate900 },
  msgDate: { fontSize: 12, color: Colors.slate400 },
  msgProperty: { fontSize: 13, color: Colors.orange, marginTop: 2 },
  msgText: { fontSize: 13, color: Colors.slate500, marginTop: 3, lineHeight: 17 },
});
