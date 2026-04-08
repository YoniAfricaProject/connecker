import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

const MENU_ITEMS = [
  { icon: 'home-outline', label: 'Accueil', route: '/(tabs)' },
  { icon: 'search-outline', label: 'Rechercher', route: '/(tabs)/search' },
  { icon: 'people-outline', label: 'Services', route: '/pages/services' },
  { icon: 'briefcase-outline', label: 'Carrieres', route: '/pages/careers' },
  { icon: 'megaphone-outline', label: 'Publicites', route: '/pages/advertising' },
  { icon: 'mail-outline', label: 'Contact', route: '/pages/contact' },
];

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: () => void;
  onHome?: () => void;
}

export function SideMenu({ visible, onClose, onSearch, onHome }: SideMenuProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handlePress = (item: any) => {
    onClose();
    if (item.label === 'Rechercher' && onSearch) {
      onSearch();
    } else if (item.label === 'Accueil' && onHome) {
      onHome();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="home" size={18} color={Colors.orange} />
            </View>
            <View>
              <Text style={styles.logoText}>Connec&apos;<Text style={{ color: Colors.orange }}>Ker</Text></Text>
              <Text style={styles.logoSub}>ku nek ak sa ker</Text>
            </View>
          </View>

          {/* Menu items */}
          <View style={styles.menuItems}>
            {MENU_ITEMS.map(item => (
              <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => handlePress(item)}>
                <Ionicons name={item.icon as any} size={18} color={Colors.slate600} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={12} color={Colors.slate300} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Connec&apos;Ker v1.0.0</Text>
            <Text style={styles.footerText}>Immobilier au Senegal</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menu: { position: 'absolute', left: 0, top: 0, bottom: 0, width: MENU_WIDTH, backgroundColor: Colors.white, paddingTop: 56, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: '800', color: Colors.slate900 },
  logoSub: { fontSize: 8, color: Colors.slate400, letterSpacing: 1, textTransform: 'uppercase' },
  menuItems: { paddingTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.slate50 },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.slate700 },
  footer: { position: 'absolute', bottom: 40, left: 20 },
  footerText: { fontSize: 9, color: Colors.slate300 },
});
