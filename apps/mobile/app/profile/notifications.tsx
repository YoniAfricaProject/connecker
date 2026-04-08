import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) { setLoading(false); return; }
      supabase.from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
        .then(({ data }) => { setNotifs(data || []); setLoading(false); });
    }, [user])
  );

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 20 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={Colors.orange} style={{ marginTop: 40 }} />
      ) : notifs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={36} color={Colors.slate200} />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySub}>Vous serez notifie des nouvelles importantes</Text>
        </View>
      ) : (
        <FlatList
          data={notifs}
          contentContainerStyle={{ padding: 14 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.notifCard, !item.read && styles.notifUnread]} onPress={() => markRead(item.id)}>
              <View style={[styles.notifDot, !item.read && styles.notifDotActive]} />
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.notifDate}>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginTop: 12 },
  emptySub: { fontSize: 10, color: Colors.slate400, marginTop: 4 },
  notifCard: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 8, gap: 10, alignItems: 'flex-start' },
  notifUnread: { backgroundColor: Colors.orangeLight + '15' },
  notifDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.slate200, marginTop: 5 },
  notifDotActive: { backgroundColor: Colors.orange },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 12, fontWeight: '600', color: Colors.slate900 },
  notifMsg: { fontSize: 10, color: Colors.slate500, marginTop: 2, lineHeight: 14 },
  notifDate: { fontSize: 9, color: Colors.slate400, marginTop: 4 },
});
