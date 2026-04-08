import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Document picker - using alert for now
import { Colors } from '../../lib/colors';

interface UploadedDoc {
  name: string;
  type: string;
  size: number;
  uri: string;
}

const DOC_TYPES = [
  { key: 'identity', label: 'Piece d\'identite', desc: 'CNI, passeport...' },
  { key: 'income', label: 'Justificatif de revenus', desc: 'Bulletins de salaire, avis d\'imposition...' },
  { key: 'domicile', label: 'Justificatif de domicile', desc: 'Facture eau/electricite, quittance...' },
  { key: 'employment', label: 'Attestation employeur', desc: 'Contrat de travail, attestation...' },
  { key: 'bank', label: 'Releve bancaire', desc: '3 derniers mois' },
  { key: 'other', label: 'Autre document', desc: 'Tout document utile' },
];

export default function DossierPage() {
  const router = useRouter();
  const [form, setForm] = useState({ profession: '', employeur: '', revenu: '', situation: 'CDI' });
  const [documents, setDocuments] = useState<Record<string, UploadedDoc>>({});
  const [saved, setSaved] = useState(false);

  const pickDocument = (key: string) => {
    // Simule un upload pour le moment
    setDocuments(prev => ({
      ...prev,
      [key]: {
        name: `document_${key}.pdf`,
        type: 'application/pdf',
        size: Math.floor(Math.random() * 500 + 100) * 1024,
        uri: '',
      },
    }));
    Alert.alert('Document ajoute', 'Le document a ete ajoute a votre dossier');
  };

  const removeDocument = (key: string) => {
    setDocuments(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const completedDocs = Object.keys(documents).length;
  const totalDocs = DOC_TYPES.length;
  const progress = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={Colors.slate900} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Mon dossier</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.orange} />
          <Text style={styles.infoText}>Completez votre dossier pour postuler plus rapidement aux biens qui vous interessent</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Dossier complet a {Math.round(progress)}%</Text>
            <Text style={styles.progressCount}>{completedDocs}/{totalDocs} documents</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Situation */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Situation professionnelle</Text>

          <Text style={styles.label}>Statut</Text>
          <View style={styles.chips}>
            {['CDI', 'CDD', 'Independant', 'Etudiant', 'Retraite', 'Autre'].map(s => (
              <TouchableOpacity key={s} style={[styles.chip, form.situation === s && styles.chipActive]} onPress={() => setForm({ ...form, situation: s })}>
                <Text style={[styles.chipText, form.situation === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Profession</Text>
          <TextInput value={form.profession} onChangeText={v => setForm({ ...form, profession: v })} style={styles.input} placeholder="Ex: Ingenieur" placeholderTextColor={Colors.slate400} />

          <Text style={styles.label}>Employeur</Text>
          <TextInput value={form.employeur} onChangeText={v => setForm({ ...form, employeur: v })} style={styles.input} placeholder="Nom de l'entreprise" placeholderTextColor={Colors.slate400} />

          <Text style={styles.label}>Revenu mensuel net (XOF)</Text>
          <TextInput value={form.revenu} onChangeText={v => setForm({ ...form, revenu: v })} style={styles.input} placeholder="Ex: 500 000" keyboardType="numeric" placeholderTextColor={Colors.slate400} />
        </View>

        {/* Documents */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.docHint}>Formats acceptes : PDF, JPG, PNG</Text>

          {DOC_TYPES.map(({ key, label, desc }) => {
            const doc = documents[key];
            return (
              <View key={key} style={styles.docItem}>
                <View style={styles.docLeft}>
                  <View style={[styles.docIcon, doc && styles.docIconDone]}>
                    <Ionicons name={doc ? 'checkmark' : 'document-outline'} size={14} color={doc ? Colors.white : Colors.slate400} />
                  </View>
                  <View style={styles.docInfo}>
                    <Text style={styles.docLabel}>{label}</Text>
                    {doc ? (
                      <Text style={styles.docName} numberOfLines={1}>{doc.name} ({(doc.size / 1024).toFixed(0)} Ko)</Text>
                    ) : (
                      <Text style={styles.docDesc}>{desc}</Text>
                    )}
                  </View>
                </View>
                {doc ? (
                  <TouchableOpacity onPress={() => removeDocument(key)} style={styles.docRemoveBtn}>
                    <Ionicons name="close" size={12} color={Colors.red} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => pickDocument(key)} style={styles.docUploadBtn}>
                    <Ionicons name="cloud-upload-outline" size={12} color={Colors.orange} />
                    <Text style={styles.docUploadText}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Save */}
        <View style={styles.form}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            {saved ? <><Ionicons name="checkmark-circle" size={14} color={Colors.white} /><Text style={styles.saveBtnText}>Sauvegarde !</Text></> : <Text style={styles.saveBtnText}>Sauvegarder le dossier</Text>}
          </TouchableOpacity>
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
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, padding: 12, backgroundColor: Colors.orangeLight + '20', borderRadius: 10, marginBottom: 6 },
  infoText: { flex: 1, fontSize: 10, color: Colors.slate600, lineHeight: 15 },
  progressSection: { marginHorizontal: 16, marginTop: 10, marginBottom: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: Colors.slate900 },
  progressCount: { fontSize: 10, color: Colors.slate400 },
  progressBar: { height: 4, backgroundColor: Colors.slate100, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 2 },
  form: { paddingHorizontal: 16, marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.slate900, marginBottom: 8, marginTop: 6 },
  label: { fontSize: 10, fontWeight: '600', color: Colors.slate500, marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.slate200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: Colors.slate900, backgroundColor: Colors.slate50 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.slate100 },
  chipActive: { backgroundColor: Colors.orange },
  chipText: { fontSize: 10, fontWeight: '500', color: Colors.slate600 },
  chipTextActive: { color: Colors.white },
  docHint: { fontSize: 9, color: Colors.slate400, marginBottom: 10 },
  docItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.slate50 },
  docLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  docIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.slate100, justifyContent: 'center', alignItems: 'center' },
  docIconDone: { backgroundColor: Colors.green },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 11, fontWeight: '600', color: Colors.slate900 },
  docDesc: { fontSize: 9, color: Colors.slate400, marginTop: 1 },
  docName: { fontSize: 9, color: Colors.green, marginTop: 1 },
  docUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.orange + '30' },
  docUploadText: { fontSize: 10, fontWeight: '500', color: Colors.orange },
  docRemoveBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.red + '10', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: Colors.orange, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  saveBtnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
});
