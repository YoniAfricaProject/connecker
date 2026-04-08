import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';

const PACKS = [
  { name: 'Standard', price: '50 000 F/mois', features: ['Annonce en avant 7j', 'Badge Recommande', 'Support email'] },
  { name: 'Premium', price: '150 000 F/mois', popular: true, features: ['Tout Standard +', 'Banniere pleine page', 'Tete des resultats', 'Stats detaillees', 'Badge Verifie'] },
  { name: 'Entreprise', price: 'Sur mesure', features: ['Tout Premium +', 'Bannieres multiples', 'API integration', 'Account manager'] },
];

export default function AdvertisingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [showDevis, setShowDevis] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleDevis = async () => {
    if (!form.name || !form.email) { Alert.alert('Erreur', 'Nom et email requis'); return; }

    // Save as a lead in Supabase for the BO team
    await supabase.from('leads').insert({
      property_id: null as any,
      sender_name: form.name,
      sender_email: form.email,
      sender_phone: form.phone || null,
      message: `[DEVIS PUB - ${selectedPack}] Entreprise: ${form.company}. ${form.message}`,
    });

    setSent(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (showDevis) { setShowDevis(false); } else router.back(); }}>
          <Ionicons name="arrow-back" size={20} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showDevis ? 'Demande de devis' : 'Publicites'}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>
        {sent ? (
          <View style={styles.sentCard}>
            <Ionicons name="checkmark-circle" size={40} color={Colors.green} />
            <Text style={styles.sentTitle}>Demande envoyee !</Text>
            <Text style={styles.sentSub}>Notre equipe vous recontactera dans les 24h pour le pack {selectedPack}</Text>
            <TouchableOpacity style={styles.sentBtn} onPress={() => router.back()}>
              <Text style={styles.sentBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : showDevis ? (
          <>
            <View style={styles.devisInfo}>
              <Ionicons name="megaphone" size={16} color={Colors.orange} />
              <Text style={styles.devisInfoText}>Pack selectionne : <Text style={{ fontWeight: '700' }}>{selectedPack}</Text></Text>
            </View>
            <TextInput placeholder="Nom complet *" value={form.name} onChangeText={v => setForm({ ...form, name: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
            <TextInput placeholder="Email *" value={form.email} onChangeText={v => setForm({ ...form, email: v })} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.slate400} />
            <TextInput placeholder="Telephone" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} style={styles.input} keyboardType="phone-pad" placeholderTextColor={Colors.slate400} />
            <TextInput placeholder="Entreprise" value={form.company} onChangeText={v => setForm({ ...form, company: v })} style={styles.input} placeholderTextColor={Colors.slate400} />
            <TextInput placeholder="Message ou precision..." value={form.message} onChangeText={v => setForm({ ...form, message: v })} style={[styles.input, { height: 70, textAlignVertical: 'top' }]} multiline placeholderTextColor={Colors.slate400} />
            <TouchableOpacity style={styles.submitBtn} onPress={handleDevis}>
              <Ionicons name="send" size={13} color={Colors.white} />
              <Text style={styles.submitText}>Envoyer la demande</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Boostez votre visibilite</Text>
            <Text style={styles.sub}>Choisissez un pack et demandez un devis. Notre equipe traite chaque demande.</Text>

            {PACKS.map(pack => (
              <View key={pack.name} style={[styles.packCard, pack.popular && styles.packPopular]}>
                {pack.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>Populaire</Text></View>}
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packPrice}>{pack.price}</Text>
                <View style={styles.packFeatures}>
                  {pack.features.map(f => (
                    <View key={f} style={styles.packFeature}>
                      <Ionicons name="checkmark" size={10} color={pack.popular ? Colors.orange : Colors.slate400} />
                      <Text style={styles.packFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.packBtn, pack.popular && styles.packBtnPopular]}
                  onPress={() => {
                    if (!user) { Alert.alert('Connexion requise', 'Connectez-vous pour demander un devis', [{ text: 'Annuler' }, { text: 'Se connecter', onPress: () => router.push('/auth/login') }]); return; }
                    setSelectedPack(pack.name);
                    setForm({ ...form, name: user.full_name, email: user.email });
                    setShowDevis(true);
                  }}
                >
                  <Text style={[styles.packBtnText, pack.popular && styles.packBtnTextPopular]}>Demander un devis</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.waBtn} onPress={() => Linking.openURL('https://wa.me/33754832723?text=Bonjour, je suis interesse par vos offres publicitaires')}>
              <Ionicons name="logo-whatsapp" size={15} color={Colors.white} />
              <Text style={styles.waBtnText}>Discuter sur WhatsApp</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10, backgroundColor: Colors.white },
  headerTitle: { fontSize: 14, fontWeight: '700', color: Colors.slate900 },
  title: { fontSize: 15, fontWeight: '800', color: Colors.slate900, marginTop: 4 },
  sub: { fontSize: 10, color: Colors.slate500, marginTop: 4, marginBottom: 14, lineHeight: 15 },
  packCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.slate100 },
  packPopular: { borderColor: Colors.orange, borderWidth: 1.5 },
  popularBadge: { position: 'absolute', top: -8, right: 12, backgroundColor: Colors.orange, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  popularText: { fontSize: 8, fontWeight: '700', color: Colors.white },
  packName: { fontSize: 13, fontWeight: '700', color: Colors.slate900 },
  packPrice: { fontSize: 16, fontWeight: '800', color: Colors.orange, marginTop: 3 },
  packFeatures: { marginTop: 10, gap: 5 },
  packFeature: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  packFeatureText: { fontSize: 10, color: Colors.slate600 },
  packBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.slate200, alignItems: 'center' },
  packBtnPopular: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  packBtnText: { fontSize: 11, fontWeight: '600', color: Colors.slate700 },
  packBtnTextPopular: { color: Colors.white },
  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#25D366', paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  waBtnText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  devisInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.orangeLight + '20', padding: 12, borderRadius: 10, marginBottom: 12 },
  devisInfoText: { fontSize: 11, color: Colors.slate700 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12, color: Colors.slate900, backgroundColor: Colors.white, marginBottom: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.orange, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  submitText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  sentCard: { alignItems: 'center', paddingVertical: 40 },
  sentTitle: { fontSize: 16, fontWeight: '700', color: Colors.slate900, marginTop: 12 },
  sentSub: { fontSize: 11, color: Colors.slate500, textAlign: 'center', marginTop: 6, lineHeight: 16 },
  sentBtn: { backgroundColor: Colors.orange, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  sentBtnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
});
