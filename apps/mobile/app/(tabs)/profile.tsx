import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

export default function ProfileTab() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (!loading && !user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={Colors.slate300} />
        <Text style={styles.title}>Connectez-vous</Text>
        <Text style={styles.sub}>Gerez votre compte et vos annonces</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/auth/register')}>
          <Text style={styles.outlineBtnText}>Creer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'announcer' ? 'Annonceur' : 'Utilisateur'}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {[
          { icon: 'heart-outline', label: 'Mes favoris', onPress: () => router.push('/(tabs)/favorites') },
          { icon: 'globe-outline', label: 'Voir le site web', onPress: () => {} },
          { icon: 'help-circle-outline', label: 'Aide & Contact', onPress: () => {} },
          { icon: 'information-circle-outline', label: 'A propos', onPress: () => {} },
        ].map(({ icon, label, onPress }) => (
          <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={20} color={Colors.slate600} />
            <Text style={styles.menuLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.slate300} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color={Colors.red} />
        <Text style={styles.logoutText}>Deconnexion</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  title: { fontSize: 20, fontWeight: '700', color: Colors.slate900, marginTop: 16 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 6 },
  primaryBtn: { backgroundColor: Colors.orange, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, marginTop: 20 },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  outlineBtn: { borderWidth: 1.5, borderColor: Colors.slate200, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, marginTop: 10 },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: Colors.slate700 },
  userCard: { alignItems: 'center', paddingVertical: 30, backgroundColor: Colors.white },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.white },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.slate900, marginTop: 12 },
  userEmail: { fontSize: 13, color: Colors.slate500, marginTop: 4 },
  roleBadge: { backgroundColor: Colors.orangeLight + '60', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: Colors.orangeDark },
  menu: { backgroundColor: Colors.white, marginTop: 16, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.slate100, gap: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.slate700 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, marginHorizontal: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.red + '30' },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.red },
});
