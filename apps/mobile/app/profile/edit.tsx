import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', phone: '', company_name: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company_name: (user as any).company_name || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('users').update({
      full_name: form.full_name,
      phone: form.phone || null,
      company_name: form.company_name || null,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.slate900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Informations personnelles</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}</Text>
          </View>
          <Text style={styles.avatarHint}>Modifier la photo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} style={styles.input} placeholder="Votre nom" placeholderTextColor={Colors.slate400} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={12} color={Colors.slate300} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telephone</Text>
            <TextInput value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} style={styles.input} placeholder="+221 XX XXX XX XX" keyboardType="phone-pad" placeholderTextColor={Colors.slate400} />
          </View>

          {user?.role === 'announcer' && (
            <View style={styles.field}>
              <Text style={styles.label}>Entreprise</Text>
              <TextInput value={form.company_name} onChangeText={v => setForm({ ...form, company_name: v })} style={styles.input} placeholder="Nom de votre agence" placeholderTextColor={Colors.slate400} />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Type de compte</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.role === 'announcer' ? 'Annonceur' : 'Particulier'}</Text>
            </View>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : saved ? (
            <><Ionicons name="checkmark-circle" size={16} color={Colors.white} /><Text style={styles.saveBtnText}>Sauvegarde !</Text></>
          ) : (
            <Text style={styles.saveBtnText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.slate900 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: Colors.white },
  avatarHint: { fontSize: 11, color: Colors.orange, fontWeight: '500', marginTop: 8 },
  form: { paddingHorizontal: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: Colors.slate500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.slate900, backgroundColor: Colors.slate50 },
  inputDisabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.slate100, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.slate50 },
  inputDisabledText: { fontSize: 14, color: Colors.slate400 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.orange, marginHorizontal: 20, paddingVertical: 14, borderRadius: 12, marginTop: 10 },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
