import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.slate50, paddingTop: 8 }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        {/* Quick contact */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL('tel:+33754832723')}>
            <Ionicons name="call-outline" size={18} color={Colors.orange} />
            <Text style={styles.quickText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL('https://wa.me/33754832723?text=Bonjour Connec\'Ker')}>
            <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
            <Text style={[styles.quickText, { color: Colors.white }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL('mailto:yoniservicesapp@gmail.com')}>
            <Ionicons name="mail-outline" size={18} color={Colors.orange} />
            <Text style={styles.quickText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Ionicons name="call-outline" size={14} color={Colors.orange} /><Text style={styles.infoText}>+33 7 54 83 27 23</Text></View>
          <View style={styles.infoRow}><Ionicons name="mail-outline" size={14} color={Colors.orange} /><Text style={styles.infoText}>yoniservicesapp@gmail.com</Text></View>
          <View style={styles.infoRow}><Ionicons name="location-outline" size={14} color={Colors.orange} /><Text style={styles.infoText}>Dakar, Senegal</Text></View>
          <View style={styles.infoRow}><Ionicons name="time-outline" size={14} color={Colors.orange} /><Text style={styles.infoText}>Lun - Ven : 9h - 18h</Text></View>
        </View>

        {/* Form */}
        {sent ? (
          <View style={styles.sentCard}>
            <Ionicons name="checkmark-circle" size={36} color={Colors.green} />
            <Text style={styles.sentTitle}>Message envoye !</Text>
            <Text style={styles.sentSub}>Nous vous repondrons rapidement</Text>
            <TouchableOpacity style={styles.sentBtn} onPress={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
              <Text style={styles.sentBtnText}>Nouveau message</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Envoyez-nous un message</Text>
            <Text style={styles.label}>Nom</Text>
            <TextInput value={form.name} onChangeText={v => setForm({ ...form, name: v })} style={styles.input} placeholder="Votre nom" placeholderTextColor={Colors.slate400} />
            <Text style={styles.label}>Email</Text>
            <TextInput value={form.email} onChangeText={v => setForm({ ...form, email: v })} style={styles.input} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.slate400} />
            <Text style={styles.label}>Message</Text>
            <TextInput value={form.message} onChangeText={v => setForm({ ...form, message: v })} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Votre message..." multiline placeholderTextColor={Colors.slate400} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={13} color={Colors.white} />
              <Text style={styles.sendBtnText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate900 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  quickBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate100 },
  quickText: { fontSize: 13, fontWeight: '600', color: Colors.slate700 },
  infoCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 14, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.slate700 },
  formCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14 },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate500, marginBottom: 4, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.orange, paddingVertical: 12, borderRadius: 12, marginTop: 14 },
  sendBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  sentCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 24, alignItems: 'center' },
  sentTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900, marginTop: 10 },
  sentSub: { fontSize: 13, color: Colors.slate500, marginTop: 4 },
  sentBtn: { backgroundColor: Colors.orange, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 14 },
  sentBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
