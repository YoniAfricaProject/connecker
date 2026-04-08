import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

export default function RegisterScreen() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (form.password.length < 6) { setError('Minimum 6 caracteres'); return; }
    setError(''); setLoading(true);
    const result = await signUp(form);
    if (result.error) { setError(result.error); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  };

  if (success) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={60} color={Colors.green} />
        <Text style={styles.title}>Compte cree !</Text>
        <Text style={styles.sub}>Vous pouvez maintenant vous connecter</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Creer un compte</Text>
          <Text style={styles.sub}>Rejoignez Connec&apos;Ker</Text>

          {/* Role */}
          <View style={styles.roleRow}>
            <TouchableOpacity style={[styles.roleBtn, form.role === 'user' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'user' })}>
              <Ionicons name="person-outline" size={20} color={form.role === 'user' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.roleLabel, form.role === 'user' && styles.roleLabelActive]}>Particulier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleBtn, form.role === 'announcer' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'announcer' })}>
              <Ionicons name="business-outline" size={20} color={form.role === 'announcer' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.roleLabel, form.role === 'announcer' && styles.roleLabelActive]}>Annonceur</Text>
            </TouchableOpacity>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.inputGroup}><Text style={styles.label}>Nom complet</Text><TextInput value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} placeholder="Votre nom" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Email</Text><TextInput value={form.email} onChangeText={v => setForm({ ...form, email: v })} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Telephone</Text><TextInput value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} placeholder="+221 XX XXX XX XX" keyboardType="phone-pad" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Mot de passe</Text><TextInput value={form.password} onChangeText={v => setForm({ ...form, password: v })} placeholder="Minimum 6 caracteres" secureTextEntry style={styles.input} placeholderTextColor={Colors.slate400} /></View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Creer mon compte</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.link}>Deja inscrit ? <Text style={styles.linkAccent}>Se connecter</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  back: { marginTop: 60, marginLeft: 20 },
  content: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.slate900 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 6, marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: Colors.slate200 },
  roleBtnActive: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight + '30' },
  roleLabel: { fontSize: 13, fontWeight: '600', color: Colors.slate500 },
  roleLabelActive: { color: Colors.orange },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: Colors.red },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: Colors.slate900 },
  button: { backgroundColor: Colors.orange, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  link: { textAlign: 'center', fontSize: 14, color: Colors.slate500 },
  linkAccent: { color: Colors.orange, fontWeight: '600' },
});
