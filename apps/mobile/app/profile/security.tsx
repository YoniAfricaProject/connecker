import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

export default function SecurityPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
    if (newPassword.length < 6) { setError('Minimum 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }

    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) { setError(err.message); return; }
    setSaved(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irreversible. Toutes vos donnees seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          if (user) {
            await supabase.from('users').delete().eq('id', user.id);
            await signOut();
          }
        }},
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Connexion & securite</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.readOnly}>
            <Ionicons name="mail-outline" size={14} color={Colors.slate400} />
            <Text style={styles.readOnlyText}>{user?.email}</Text>
            <Ionicons name="lock-closed" size={10} color={Colors.slate300} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changer le mot de passe</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry style={styles.input} placeholder="Minimum 6 caracteres" placeholderTextColor={Colors.slate400} />

          <Text style={styles.label}>Confirmer</Text>
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} placeholder="Retapez le mot de passe" placeholderTextColor={Colors.slate400} />

          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
            {saved ? <><Ionicons name="checkmark-circle" size={14} color={Colors.white} /><Text style={styles.saveBtnText}>Mot de passe modifie !</Text></> : <Text style={styles.saveBtnText}>Modifier le mot de passe</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone danger</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={14} color={Colors.red} />
            <Text style={styles.deleteBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
          <Text style={styles.deleteHint}>Cette action est irreversible</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.slate900, marginBottom: 10 },
  readOnly: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.slate50, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.slate100 },
  readOnlyText: { flex: 1, fontSize: 12, color: Colors.slate500 },
  label: { fontSize: 10, fontWeight: '600', color: Colors.slate500, marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: Colors.slate900, backgroundColor: Colors.slate50 },
  error: { fontSize: 10, color: Colors.red, marginBottom: 6, backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: Colors.orange, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  saveBtnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: Colors.red + '30', paddingVertical: 12, borderRadius: 12 },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: Colors.red },
  deleteHint: { fontSize: 9, color: Colors.slate400, textAlign: 'center', marginTop: 6 },
});
