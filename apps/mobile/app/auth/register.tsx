import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useI18n } from '../../lib/i18n';
import { Colors } from '../../lib/colors';

export default function RegisterScreen() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const handleRegister = async () => {
    if (form.password.length < 6) { setError('Minimum 6 caracteres'); return; }
    setError(''); setLoading(true);
    const result = await signUp(form);
    if (result.error) { setError(result.error); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  };

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={60} color={Colors.green} />
          <Text style={styles.title}>{t('auth.successTitle')}</Text>
          <Text style={styles.sub}>{t('auth.successSub')}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth/login')}>
            <Text style={styles.buttonText}>{t('auth.goToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.sub}>{t('auth.registerSub')}</Text>

          {/* Role */}
          <View style={styles.roleRow}>
            <TouchableOpacity style={[styles.roleBtn, form.role === 'user' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'user' })}>
              <Ionicons name="person-outline" size={20} color={form.role === 'user' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.roleLabel, form.role === 'user' && styles.roleLabelActive]}>{t('auth.individual')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleBtn, form.role === 'announcer' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'announcer' })}>
              <Ionicons name="business-outline" size={20} color={form.role === 'announcer' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.roleLabel, form.role === 'announcer' && styles.roleLabelActive]}>{t('auth.announcer')}</Text>
            </TouchableOpacity>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.inputGroup}><Text style={styles.label}>{t('auth.fullName')}</Text><TextInput value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} placeholder="Votre nom" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>{t('auth.email')}</Text><TextInput value={form.email} onChangeText={v => setForm({ ...form, email: v })} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>{t('auth.phone')}</Text><TextInput value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} placeholder="+221 XX XXX XX XX" keyboardType="phone-pad" style={styles.input} placeholderTextColor={Colors.slate400} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>{t('auth.password')}</Text><TextInput value={form.password} onChangeText={v => setForm({ ...form, password: v })} placeholder="Minimum 6 caracteres" secureTextEntry style={styles.input} placeholderTextColor={Colors.slate400} /></View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.signUp')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.link}>{t('auth.hasAccount')} <Text style={styles.linkAccent}>{t('auth.signInLink')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.white },
  back: { marginTop: 10, marginLeft: 16 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 },
  title: { fontSize: 21, fontWeight: '800', color: Colors.slate900 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 4, marginBottom: 18 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.slate200 },
  roleBtnActive: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight + '20' },
  roleLabel: { fontSize: 13, fontWeight: '600', color: Colors.slate500 },
  roleLabelActive: { color: Colors.orange },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { fontSize: 13, color: Colors.red },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },
  button: { backgroundColor: Colors.orange, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 14 },
  buttonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  link: { textAlign: 'center', fontSize: 14, color: Colors.slate500 },
  linkAccent: { color: Colors.orange, fontWeight: '600' },
});
