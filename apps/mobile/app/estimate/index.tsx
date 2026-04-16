import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

const COMMUNES = ['Plateau', 'Almadies', 'Mermoz', 'Ngor', 'Ouakam', 'Yoff', 'Pikine', 'Grand Yoff', 'Parcelles', 'Medina', 'HLM', 'Liberte', 'Fann', 'Sacre Coeur', 'Guediawaye', 'Rufisque', 'Diamniadio'];

// Average prices per m2 by commune (XOF)
const PRICE_DATA: Record<string, { appart_rent: number; house_rent: number; appart_sale: number; house_sale: number }> = {
  'Plateau': { appart_rent: 8500, house_rent: 12000, appart_sale: 1200000, house_sale: 1500000 },
  'Almadies': { appart_rent: 12000, house_rent: 18000, appart_sale: 1800000, house_sale: 2500000 },
  'Mermoz': { appart_rent: 7000, house_rent: 10000, appart_sale: 1000000, house_sale: 1400000 },
  'Ngor': { appart_rent: 9000, house_rent: 15000, appart_sale: 1500000, house_sale: 2000000 },
  'Ouakam': { appart_rent: 5500, house_rent: 8000, appart_sale: 800000, house_sale: 1100000 },
  'Yoff': { appart_rent: 5000, house_rent: 7500, appart_sale: 700000, house_sale: 950000 },
  'Pikine': { appart_rent: 3000, house_rent: 4500, appart_sale: 400000, house_sale: 550000 },
  'Grand Yoff': { appart_rent: 4000, house_rent: 6000, appart_sale: 550000, house_sale: 750000 },
  'Parcelles': { appart_rent: 3500, house_rent: 5000, appart_sale: 450000, house_sale: 650000 },
  'Medina': { appart_rent: 4500, house_rent: 7000, appart_sale: 600000, house_sale: 900000 },
  'HLM': { appart_rent: 4000, house_rent: 5500, appart_sale: 500000, house_sale: 700000 },
  'Liberte': { appart_rent: 5000, house_rent: 7000, appart_sale: 650000, house_sale: 900000 },
  'Fann': { appart_rent: 7500, house_rent: 11000, appart_sale: 1100000, house_sale: 1500000 },
  'Sacre Coeur': { appart_rent: 7000, house_rent: 10000, appart_sale: 1000000, house_sale: 1300000 },
  'Guediawaye': { appart_rent: 2500, house_rent: 4000, appart_sale: 350000, house_sale: 500000 },
  'Rufisque': { appart_rent: 2000, house_rent: 3500, appart_sale: 300000, house_sale: 450000 },
  'Diamniadio': { appart_rent: 3000, house_rent: 4000, appart_sale: 350000, house_sale: 500000 },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

export default function EstimatePage() {
  const router = useRouter();
  const [commune, setCommune] = useState('');
  const [type, setType] = useState<'apartment' | 'house'>('apartment');
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [result, setResult] = useState<{ rent: number; sale: number } | null>(null);

  const calculate = () => {
    const data = PRICE_DATA[commune];
    if (!data || !surface) return;

    const s = Number(surface);
    const roomBonus = rooms ? (Number(rooms) - 2) * 0.03 : 0; // +3% per room above 2

    const rentPerM2 = type === 'apartment' ? data.appart_rent : data.house_rent;
    const salePerM2 = type === 'apartment' ? data.appart_sale : data.house_sale;

    const rent = Math.round(rentPerM2 * s * (1 + roomBonus));
    const sale = Math.round(salePerM2 * s * (1 + roomBonus));

    setResult({ rent, sale });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 8 }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.slate900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estimation de bien</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="calculator-outline" size={24} color={Colors.orange} />
          </View>
          <Text style={styles.introText}>Estimez la valeur de votre bien en fonction des prix du marche a Dakar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Type */}
          <Text style={styles.label}>Type de bien</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity style={[styles.typeBtn, type === 'apartment' && styles.typeBtnActive]} onPress={() => setType('apartment')}>
              <Ionicons name="business" size={16} color={type === 'apartment' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.typeLabel, type === 'apartment' && styles.typeLabelActive]}>Appartement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeBtn, type === 'house' && styles.typeBtnActive]} onPress={() => setType('house')}>
              <Ionicons name="home" size={16} color={type === 'house' ? Colors.orange : Colors.slate400} />
              <Text style={[styles.typeLabel, type === 'house' && styles.typeLabelActive]}>Maison</Text>
            </TouchableOpacity>
          </View>

          {/* Commune */}
          <Text style={styles.label}>Commune</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.communeScroll}>
            {COMMUNES.map(c => (
              <TouchableOpacity key={c} style={[styles.communeChip, commune === c && styles.communeChipActive]} onPress={() => setCommune(c)}>
                <Text style={[styles.communeText, commune === c && styles.communeTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Surface */}
          <Text style={styles.label}>Surface (m²)</Text>
          <TextInput value={surface} onChangeText={setSurface} style={styles.input} placeholder="Ex: 80" keyboardType="numeric" placeholderTextColor={Colors.slate400} />

          {/* Rooms */}
          <Text style={styles.label}>Nombre de pieces</Text>
          <TextInput value={rooms} onChangeText={setRooms} style={styles.input} placeholder="Ex: 3" keyboardType="numeric" placeholderTextColor={Colors.slate400} />

          {/* Calculate */}
          <TouchableOpacity style={[styles.calcBtn, (!commune || !surface) && styles.calcBtnDisabled]} onPress={calculate} disabled={!commune || !surface}>
            <Ionicons name="calculator" size={16} color={Colors.white} />
            <Text style={styles.calcBtnText}>Estimer</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Estimation pour {commune}</Text>
            <Text style={styles.resultSub}>{type === 'apartment' ? 'Appartement' : 'Maison'} de {surface} m²{rooms ? `, ${rooms} pieces` : ''}</Text>

            <View style={styles.resultCards}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Loyer mensuel</Text>
                <Text style={styles.resultValue}>{formatPrice(result.rent)}</Text>
                <Text style={styles.resultHint}>/mois</Text>
              </View>
              <View style={[styles.resultCard, styles.resultCardSale]}>
                <Text style={styles.resultLabel}>Prix de vente</Text>
                <Text style={[styles.resultValue, { color: Colors.orange }]}>{formatPrice(result.sale)}</Text>
                <Text style={styles.resultHint}>estimation</Text>
              </View>
            </View>

            <Text style={styles.disclaimer}>Estimation indicative basee sur les moyennes du marche. Les prix reels peuvent varier.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900 },
  intro: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 14, backgroundColor: Colors.orangeLight + '20', borderRadius: 12, marginBottom: 10 },
  introIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.orangeLight + '40', justifyContent: 'center', alignItems: 'center' },
  introText: { flex: 1, fontSize: 14, color: Colors.slate600, lineHeight: 19 },
  form: { paddingHorizontal: 16, paddingTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate500, marginBottom: 6, marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.slate200 },
  typeBtnActive: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight + '20' },
  typeLabel: { fontSize: 15, fontWeight: '600', color: Colors.slate500 },
  typeLabelActive: { color: Colors.orange },
  communeScroll: { marginBottom: 4 },
  communeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.slate100, marginRight: 6 },
  communeChipActive: { backgroundColor: Colors.orange },
  communeText: { fontSize: 14, fontWeight: '500', color: Colors.slate600 },
  communeTextActive: { color: Colors.white },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: Colors.slate900, backgroundColor: Colors.slate50 },
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.orange, paddingVertical: 13, borderRadius: 12, marginTop: 28 },
  calcBtnDisabled: { opacity: 0.5 },
  calcBtnText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  resultSection: { marginHorizontal: 16, marginTop: 24 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: Colors.slate900 },
  resultSub: { fontSize: 14, color: Colors.slate500, marginTop: 2 },
  resultCards: { flexDirection: 'row', gap: 10, marginTop: 14 },
  resultCard: { flex: 1, backgroundColor: Colors.slate50, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.slate100 },
  resultCardSale: { backgroundColor: Colors.orangeLight + '15', borderColor: Colors.orangeLight },
  resultLabel: { fontSize: 13, color: Colors.slate500, fontWeight: '500' },
  resultValue: { fontSize: 21, fontWeight: '800', color: Colors.slate900, marginTop: 4 },
  resultHint: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  disclaimer: { fontSize: 12, color: Colors.slate400, marginTop: 12, fontStyle: 'italic', lineHeight: 17 },
});
