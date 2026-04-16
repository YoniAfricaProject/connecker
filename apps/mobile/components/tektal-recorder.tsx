import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Colors } from '../lib/colors';

interface TektalRecorderProps {
  onRecorded: (uri: string, duration: number) => void;
  label?: string;
}

export function TektalRecorder({ onRecorded, label = 'Description vocale' }: TektalRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission requise', 'Autorisez le micro pour enregistrer'); return; }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);
      setAudioUri(null);

      timerRef.current = setInterval(() => {
        setDuration(d => {
          if (d >= 30) { stopRecording(); return 30; }
          return d + 1;
        });
      }, 1000);
    } catch {
      Alert.alert('Erreur', 'Impossible de demarrer l\'enregistrement');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      setAudioUri(uri);
      onRecorded(uri, duration);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    if (playing && soundRef.current) {
      await soundRef.current.stopAsync();
      setPlaying(false);
      return;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    soundRef.current = sound;
    setPlaying(true);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) setPlaying(false);
    });
  };

  const deleteAudio = () => {
    setAudioUri(null);
    setDuration(0);
    onRecorded('', 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mic-outline" size={13} color={Colors.orange} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>Max 30s</Text>
      </View>

      {!audioUri ? (
        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View style={styles.recordInner}>
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={18} color={isRecording ? Colors.white : Colors.orange} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={[styles.recordText, isRecording && styles.recordTextActive]}>
              {isRecording ? 'Enregistrement en cours...' : 'Appuyez pour enregistrer'}
            </Text>
            {isRecording && (
              <View style={styles.timerRow}>
                <View style={styles.redDot} />
                <Text style={styles.timer}>{duration}s / 30s</Text>
              </View>
            )}
            {!isRecording && <Text style={styles.recordSub}>Decrivez le bien ou comment y acceder</Text>}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.playbackRow}>
          <TouchableOpacity style={styles.playBtn} onPress={playAudio}>
            <Ionicons name={playing ? 'pause' : 'play'} size={14} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.waveform}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.bar, { height: 4 + Math.random() * 12, opacity: playing ? 1 : 0.4 }]} />
            ))}
          </View>
          <Text style={styles.playDuration}>{duration}s</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={deleteAudio}>
            <Ionicons name="trash-outline" size={13} color={Colors.red} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.slate500, textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { fontSize: 11, color: Colors.slate400, marginLeft: 'auto' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.slate50, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.slate200 },
  recordBtnActive: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  recordInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.orangeLight + '30', justifyContent: 'center', alignItems: 'center' },
  recordInfo: { flex: 1 },
  recordText: { fontSize: 14, fontWeight: '500', color: Colors.slate700 },
  recordTextActive: { color: Colors.red },
  recordSub: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  timer: { fontSize: 13, fontWeight: '600', color: Colors.red },
  playbackRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.slate50, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: Colors.slate200 },
  playBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 20 },
  bar: { width: 2, backgroundColor: Colors.orange, borderRadius: 1 },
  playDuration: { fontSize: 13, fontWeight: '600', color: Colors.slate600 },
  deleteBtn: { padding: 4 },
});
