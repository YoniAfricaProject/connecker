import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

interface MenuItem {
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
}

function MenuGroup({ items }: { items: MenuItem[] }) {
  return (
    <View style={styles.menuGroup}>
      {items.map((item, i) => (
        <TouchableOpacity key={item.label} style={[styles.menuItem, i < items.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon as any} size={16} color={Colors.slate600} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color={Colors.slate300} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ProfileTab() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (!loading && !user) {
    return (
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Ionicons name="person-outline" size={28} color={Colors.orange} />
        </View>
        <Text style={styles.centerTitle}>Mon compte</Text>
        <Text style={styles.centerSub}>Connectez-vous pour gerer votre profil, vos annonces et vos favoris</Text>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User header */}
      <TouchableOpacity style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.userRole}>{user?.role === 'announcer' ? 'Annonceur' : 'Particulier'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={Colors.slate300} />
      </TouchableOpacity>

      {/* Group 1 - Mon compte */}
      <MenuGroup items={[
        { icon: 'person-outline', label: 'Informations personnelles', sub: 'Nom, telephone, email...', onPress: () => router.push('/profile/edit') },
        { icon: 'folder-outline', label: 'Mon dossier', sub: 'Situation professionnelle, documents...', onPress: () => router.push('/profile/dossier') },
      ]} />

      {/* Group 2 - Communication */}
      <MenuGroup items={[
        { icon: 'chatbubble-outline', label: 'Messages', sub: 'Recevoir et envoyer des messages', onPress: () => router.push('/profile/messages') },
        { icon: 'notifications-outline', label: 'Notifications', sub: 'Personnalisez vos alertes', onPress: () => router.push('/profile/notifications') },
        { icon: 'heart-outline', label: 'Mes favoris', sub: 'Biens sauvegardes', onPress: () => router.push('/profile/favorites') },
      ]} />

      {/* Group 3 - Securite */}
      <MenuGroup items={[
        { icon: 'lock-closed-outline', label: 'Connexion & securite', sub: 'Modifiez votre email, mot de passe...', onPress: () => router.push('/profile/security') },
        { icon: 'language-outline', label: 'Parametres de langue', sub: 'Francais', onPress: () => router.push('/profile/language') },
      ]} />

      {/* Group 4 - Outils */}
      <MenuGroup items={[
        { icon: 'build-outline', label: 'Outils & services', sub: 'Trouvez un agent, un notaire...', onPress: () => router.push('/profile/services') },
        { icon: 'calculator-outline', label: 'Estimation de bien', sub: 'Obtenez une idee de la valeur', onPress: () => router.push('/estimate') },
      ]} />

      {/* Deconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={15} color={Colors.red} />
        <Text style={styles.logoutText}>Deconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Connec&apos;Ker v1.0.0</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: Colors.white },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  centerTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900 },
  centerSub: { fontSize: 11, color: Colors.slate500, textAlign: 'center', marginTop: 6, lineHeight: 17, paddingHorizontal: 10 },
  primaryBtn: { backgroundColor: Colors.orange, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 12, marginTop: 18 },
  primaryBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  outlineBtn: { borderWidth: 1.5, borderColor: Colors.slate200, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 12, marginTop: 8 },
  outlineBtnText: { fontSize: 13, fontWeight: '600', color: Colors.slate700 },

  userHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 14, marginTop: 6, marginHorizontal: 14, borderRadius: 12, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  userRole: { fontSize: 10, color: Colors.slate500, marginTop: 1 },

  menuGroup: { backgroundColor: Colors.white, marginTop: 10, marginHorizontal: 14, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 10 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.slate50 },
  menuIcon: { width: 28, height: 28, borderRadius: 7, backgroundColor: Colors.slate50, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 12, fontWeight: '600', color: Colors.slate900 },
  menuSub: { fontSize: 9, color: Colors.slate400, marginTop: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 14, marginHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.white },
  logoutText: { fontSize: 12, fontWeight: '600', color: Colors.red },

  version: { textAlign: 'center', fontSize: 9, color: Colors.slate300, marginTop: 14 },
});
