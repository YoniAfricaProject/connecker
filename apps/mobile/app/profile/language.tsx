import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useI18n } from '../../lib/i18n';

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguagePage() {
  const router = useRouter();
  const { lang, setLang, t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.list}>
        {LANGUAGES.map(l => (
          <TouchableOpacity key={l.code} style={[styles.item, lang === l.code && styles.itemActive]} onPress={() => setLang(l.code as 'fr' | 'en')}>
            <Text style={styles.flag}>{l.flag}</Text>
            <Text style={[styles.itemLabel, lang === l.code && styles.itemLabelActive]}>{l.label}</Text>
            {lang === l.code && <Ionicons name="checkmark-circle" size={18} color={Colors.orange} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>{t('language.hint')}</Text>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate900 },
  list: { paddingHorizontal: 16, marginTop: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate100, marginBottom: 8 },
  itemActive: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight + '15' },
  flag: { fontSize: 23 },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.slate700 },
  itemLabelActive: { fontWeight: '600', color: Colors.orange },
  hint: { fontSize: 13, color: Colors.slate400, textAlign: 'center', marginTop: 16, paddingHorizontal: 20 },
});
