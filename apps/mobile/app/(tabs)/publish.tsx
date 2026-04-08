import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

export default function PublishTab() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.slate300} />
        <Text style={styles.title}>Connectez-vous</Text>
        <Text style={styles.sub}>Vous devez etre connecte pour publier une annonce</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Ionicons name="add-circle-outline" size={48} color={Colors.orange} />
      <Text style={styles.title}>Publier une annonce</Text>
      <Text style={styles.sub}>Pour publier un bien, utilisez le site web pour le moment</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('https://connecker.vercel.app/dashboard/properties/new' as any)}>
        <Ionicons name="globe-outline" size={18} color={Colors.white} />
        <Text style={styles.buttonText}>Ouvrir le site</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  title: { fontSize: 20, fontWeight: '700', color: Colors.slate900, marginTop: 16 },
  sub: { fontSize: 14, color: Colors.slate500, textAlign: 'center', marginTop: 8 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.orange, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginTop: 24 },
  buttonText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
