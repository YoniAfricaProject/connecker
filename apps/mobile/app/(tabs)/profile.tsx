import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useI18n } from '../../lib/i18n';
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
  const { t, lang } = useI18n();

  if (!loading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Ionicons name="person-outline" size={28} color={Colors.orange} />
        </View>
        <Text style={styles.centerTitle}>{t('profile.myAccount')}</Text>
        <Text style={styles.centerSub}>{t('profile.accountSub')}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryBtnText}>{t('auth.signIn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/auth/register')}>
          <Text style={styles.outlineBtnText}>{t('auth.createAccount')}</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{t('profile.title')}</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.slate400} />
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User header */}
      <TouchableOpacity style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.userRole}>{user?.role === 'announcer' ? t('auth.announcer') : t('auth.individual')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={Colors.slate300} />
      </TouchableOpacity>

      {/* Group 1 - Mon compte */}
      <MenuGroup items={[
        { icon: 'person-outline', label: t('profile.personalInfo'), sub: t('profile.personalInfoSub'), onPress: () => router.push('/profile/edit') },
        { icon: 'folder-outline', label: t('profile.myFolder'), sub: t('profile.myFolderSub'), onPress: () => router.push('/profile/dossier') },
      ]} />

      {/* Group 2 - Communication */}
      <MenuGroup items={[
        { icon: 'chatbubble-outline', label: t('profile.messages'), sub: t('profile.messagesSub'), onPress: () => router.push('/profile/messages') },
        { icon: 'notifications-outline', label: t('profile.notifications'), sub: t('profile.notificationsSub'), onPress: () => router.push('/profile/notifications') },
        { icon: 'heart-outline', label: t('profile.myFavorites'), sub: t('profile.myFavoritesSub'), onPress: () => router.push('/profile/favorites') },
      ]} />

      {/* Group 3 - Securite */}
      <MenuGroup items={[
        { icon: 'lock-closed-outline', label: t('profile.security'), sub: t('profile.securitySub'), onPress: () => router.push('/profile/security') },
        { icon: 'language-outline', label: t('profile.language'), sub: lang === 'fr' ? 'Francais' : 'English', onPress: () => router.push('/profile/language') },
      ]} />

      {/* Group 4 - Outils */}
      <MenuGroup items={[
        { icon: 'build-outline', label: t('profile.tools'), sub: t('profile.toolsSub'), onPress: () => router.push('/profile/services') },
        { icon: 'calculator-outline', label: t('profile.estimate'), sub: t('profile.estimateSub'), onPress: () => router.push('/estimate') },
      ]} />

      {/* Deconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={15} color={Colors.red} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Connec&apos;Ker v1.0.0</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.slate900 },
  container: { flex: 1, backgroundColor: Colors.slate50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: Colors.white },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  centerTitle: { fontSize: 19, fontWeight: '700', color: Colors.slate900 },
  centerSub: { fontSize: 14, color: Colors.slate500, textAlign: 'center', marginTop: 6, lineHeight: 20, paddingHorizontal: 10 },
  primaryBtn: { backgroundColor: Colors.orange, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 12, marginTop: 18 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  outlineBtn: { borderWidth: 1.5, borderColor: Colors.slate200, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 12, marginTop: 8 },
  outlineBtnText: { fontSize: 16, fontWeight: '600', color: Colors.slate700 },

  userHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 16, marginTop: 6, marginHorizontal: 14, borderRadius: 12, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', color: Colors.slate900 },
  userRole: { fontSize: 13, color: Colors.slate500, marginTop: 1 },

  menuGroup: { backgroundColor: Colors.white, marginTop: 14, marginHorizontal: 14, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 10 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.slate50 },
  menuIcon: { width: 28, height: 28, borderRadius: 7, backgroundColor: Colors.slate50, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.slate900 },
  menuSub: { fontSize: 12, color: Colors.slate400, marginTop: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 14, marginHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.white },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.red },

  version: { textAlign: 'center', fontSize: 12, color: Colors.slate300, marginTop: 14 },
});
