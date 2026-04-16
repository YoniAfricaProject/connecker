import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../lib/use-network';
import { Colors } from '../lib/colors';

export function OfflineBanner() {
  const { online } = useNetwork();
  if (online) return null;
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={14} color={Colors.white} />
      <Text style={styles.text}>Pas de connexion — données mises en cache</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.slate800,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: { color: Colors.white, fontSize: 12, fontWeight: '500' },
});
