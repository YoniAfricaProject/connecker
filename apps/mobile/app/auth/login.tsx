import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useI18n } from '../../lib/i18n';
import { Colors } from '../../lib/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError(t('auth.wrongCredentials'));
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.login')}</Text>
          <Text style={styles.sub}>{t('auth.loginSub')}</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder={t('auth.emailPlaceholder')} keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={Colors.slate400} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder={t('auth.passwordPlaceholder')} secureTextEntry style={styles.input} placeholderTextColor={Colors.slate400} />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.signIn')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.link}>{t('auth.noAccount')} <Text style={styles.linkAccent}>{t('auth.createAccount')}</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  back: { marginTop: 10, marginLeft: 16 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  title: { fontSize: 21, fontWeight: '800', color: Colors.slate900 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 6, marginBottom: 24 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { fontSize: 13, color: Colors.red },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: Colors.slate900, backgroundColor: Colors.slate50 },
  button: { backgroundColor: Colors.orange, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  link: { textAlign: 'center', fontSize: 14, color: Colors.slate500 },
  linkAccent: { color: Colors.orange, fontWeight: '600' },
});
