import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.slate900} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.sub}>Connectez-vous a votre compte Connec&apos;Ker</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={Colors.slate400} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Votre mot de passe" secureTextEntry style={styles.input} placeholderTextColor={Colors.slate400} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Pas de compte ? <Text style={styles.linkAccent}>Creer un compte</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  back: { marginTop: 60, marginLeft: 20 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.slate900 },
  sub: { fontSize: 14, color: Colors.slate500, marginTop: 8, marginBottom: 30 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: Colors.red },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: Colors.slate900 },
  button: { backgroundColor: Colors.orange, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  link: { textAlign: 'center', fontSize: 14, color: Colors.slate500 },
  linkAccent: { color: Colors.orange, fontWeight: '600' },
});
