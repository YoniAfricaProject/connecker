import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Colors } from '../lib/colors';

interface TektalPlayerMobileProps {
  propertyId: string;
}

export function TektalPlayerMobile({ propertyId }: TektalPlayerMobileProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const { data } = supabase.storage.from('property-images').getPublicUrl(`tektal/${propertyId}.m4a`);

    fetch(data.publicUrl, { method: 'HEAD' }).then(res => {
      if (res.ok) setAudioUrl(data.publicUrl);
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => { soundRef.current?.unloadAsync(); };
  }, [propertyId]);

  const togglePlay = async () => {
    if (!audioUrl) return;

    if (playing && soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlaying(true);
      return;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    soundRef.current = sound;
    setPlaying(true);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        setPlaying(false);
        soundRef.current = null;
      }
    });
  };

  if (loading || !audioUrl) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="mic" size={11} color={Colors.orange} /> Tektal - Description vocale
      </Text>
      <View style={styles.player}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <Ionicons name={playing ? 'pause' : 'play'} size={13} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.waveform}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: 3 + Math.sin(i * 0.7) * 6 + Math.random() * 3, opacity: playing ? 0.8 : 0.35 },
              ]}
            />
          ))}
        </View>
        <Text style={styles.label}>{playing ? 'Lecture...' : 'Ecouter'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.slate900, marginBottom: 6 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.slate50, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: Colors.slate200 },
  playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.orange, justifyContent: 'center', alignItems: 'center' },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 1.5, height: 16 },
  bar: { width: 2, backgroundColor: Colors.orange, borderRadius: 1 },
  label: { fontSize: 12, color: Colors.slate500 },
});
