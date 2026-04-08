import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo appears and scales
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Text appears
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Line expands
      Animated.timing(lineWidth, { toValue: 1, duration: 300, useNativeDriver: false }),
      // Slogan appears
      Animated.timing(sloganOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Navigate after animation
    setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('onboarded');
      if (hasOnboarded === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 2800);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.logoBox}>
          <View style={styles.roofTop}>
            <View style={styles.roofLine} />
          </View>
          <Ionicons name="home" size={32} color={Colors.orange} />
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.appName}>
          Connec&apos;<Text style={styles.appNameAccent}>Kër</Text>
        </Text>
      </Animated.View>

      {/* Decorative line */}
      <Animated.View style={[styles.line, { width: lineWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) }]} />

      {/* Slogan */}
      <Animated.View style={{ opacity: sloganOpacity }}>
        <Text style={styles.slogan}>KU NEK AK SA KËR</Text>
        <Text style={styles.tagline}>L&apos;immobilier au Senegal</Text>
      </Animated.View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate900, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.orange, opacity: 0.05, top: '30%' },
  logoContainer: { marginBottom: 16 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.2)', justifyContent: 'center', alignItems: 'center' },
  roofTop: { position: 'absolute', top: -6, alignItems: 'center' },
  roofLine: { width: 30, height: 2, backgroundColor: Colors.orange, borderRadius: 1 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  appNameAccent: { color: Colors.orange },
  line: { height: 2, backgroundColor: Colors.orange, borderRadius: 1, marginTop: 20, marginBottom: 16, opacity: 0.4 },
  slogan: { fontSize: 9, color: Colors.slate500, letterSpacing: 3, textAlign: 'center', fontWeight: '500' },
  tagline: { fontSize: 11, color: Colors.slate400, textAlign: 'center', marginTop: 6 },
  bottom: { position: 'absolute', bottom: 50 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.slate700 },
  dotActive: { backgroundColor: Colors.orange, width: 12 },
});
