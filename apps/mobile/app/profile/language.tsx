import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'wo', label: 'Wolof', flag: '🇸🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('fr');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Langue</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.list}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity key={lang.code} style={[styles.item, selected === lang.code && styles.itemActive]} onPress={() => setSelected(lang.code)}>
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={[styles.itemLabel, selected === lang.code && styles.itemLabelActive]}>{lang.label}</Text>
            {selected === lang.code && <Ionicons name="checkmark-circle" size={18} color={Colors.orange} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>La traduction Wolof et Anglais sera disponible prochainement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  list: { paddingHorizontal: 16, marginTop: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 8 },
  itemActive: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight + '15' },
  flag: { fontSize: 20 },
  itemLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.slate700 },
  itemLabelActive: { fontWeight: '600', color: Colors.orange },
  hint: { fontSize: 10, color: Colors.slate400, textAlign: 'center', marginTop: 16, paddingHorizontal: 20 },
});
