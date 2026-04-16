import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

const { width, height } = Dimensions.get('window');

function FloatingParticle({ delay, x, size, duration }: { delay: number; x: number; size: number; duration: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.6, duration: duration * 0.3, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: duration * 0.7, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.orange,
        opacity,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [height * 0.8, -size] }),
        }],
      }}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const bgGlow = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.5)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0.5)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(20)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const flagsTranslateX = useRef(new Animated.Value(width)).current;
  const flagsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgGlow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bgGlow, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Main sequence
    Animated.sequence([
      // 1. Logo appears with spring bounce
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // 2. Ring pulse 1
      Animated.parallel([
        Animated.timing(ringScale1, { toValue: 2.5, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ringOpacity1, { toValue: 0.4, duration: 200, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        // Ring pulse 2 (delayed)
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(ringScale2, { toValue: 2, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(ringOpacity2, { toValue: 0.3, duration: 150, useNativeDriver: true }),
              Animated.timing(ringOpacity2, { toValue: 0, duration: 550, useNativeDriver: true }),
            ]),
          ]),
        ]),
      ]),
      // 3. App name slides up
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(nameTranslateY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
      // 4. Decorative line
      Animated.spring(lineScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      // 5. Slogan + tagline
      Animated.stagger(200, [
        Animated.timing(sloganOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 6. Bottom dots
      Animated.timing(bottomOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Flags slide in immediately (parallel to main sequence)
    Animated.parallel([
      Animated.timing(flagsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(flagsTranslateX, { toValue: 0, friction: 7, tension: 30, useNativeDriver: true }),
    ]).start();

    // Shimmer loop on logo
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Navigate
    setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('onboarded');
      if (hasOnboarded === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 4500);
  }, []);

  const particles = [
    { delay: 300, x: width * 0.15, size: 4, duration: 4000 },
    { delay: 800, x: width * 0.35, size: 3, duration: 3500 },
    { delay: 500, x: width * 0.55, size: 5, duration: 4500 },
    { delay: 1200, x: width * 0.75, size: 3, duration: 3800 },
    { delay: 200, x: width * 0.9, size: 4, duration: 4200 },
    { delay: 1500, x: width * 0.25, size: 2, duration: 3200 },
    { delay: 900, x: width * 0.65, size: 3, duration: 3600 },
    { delay: 600, x: width * 0.45, size: 4, duration: 4100 },
    { delay: 1100, x: width * 0.05, size: 3, duration: 3900 },
    { delay: 400, x: width * 0.85, size: 2, duration: 3400 },
  ];

  return (
    <View style={styles.container}>
      {/* Animated background glow */}
      <Animated.View style={[styles.bgGlow1, { opacity: bgGlow.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.08] }) }]} />
      <Animated.View style={[styles.bgGlow2, { opacity: bgGlow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.02] }) }]} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Subtle grid pattern */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, { top: (height / 6) * (i + 1) }]} />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: (width / 4) * (i + 1) }]} />
        ))}
      </View>

      {/* Pulse rings */}
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]} />
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Ionicons name="home" size={36} color={Colors.orange} />
          </View>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmer, {
          transform: [{
            translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-80, 80] }),
          }],
        }]} />
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: nameOpacity, transform: [{ translateY: nameTranslateY }], marginTop: 24 }}>
        <Text style={styles.appName}>
          Connec&apos;<Text style={styles.appNameAccent}>Ker</Text>
        </Text>
      </Animated.View>

      {/* Decorative line */}
      <Animated.View style={[styles.lineWrap, { transform: [{ scaleX: lineScale }] }]}>
        <View style={styles.lineFade} />
        <View style={styles.lineCenter} />
        <View style={styles.lineDot} />
        <View style={styles.lineCenter} />
        <View style={styles.lineFade} />
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={{ opacity: sloganOpacity }}>
        <Text style={styles.slogan}>KU NEK AK SA KER</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity, marginTop: 8 }}>
        <Text style={styles.tagline}>L&apos;immobilier au Senegal</Text>
      </Animated.View>

      {/* UEMOA Flags - positioned above bottom */}
      <Animated.View style={[styles.flagsContainer, { opacity: flagsOpacity, transform: [{ translateX: flagsTranslateX }] }]}>
        <View style={styles.flagItem}>
          <Text style={styles.flagEmoji}>🇸🇳</Text>
        </View>
        <Text style={styles.flagsLabel}>Made in Senegal</Text>
      </Animated.View>

      {/* Bottom */}
      <Animated.View style={[styles.bottom, { opacity: bottomOpacity }]}>
        <View style={styles.bottomLine} />
        <Text style={styles.bottomText}>CONNEC&apos;KER</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },

  // Background
  bgGlow1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.orange, top: '20%', left: -50 },
  bgGlow2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: Colors.orange, bottom: '15%', right: -40 },

  // Grid
  gridOverlay: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.02)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.02)' },

  // Pulse rings
  ring: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: Colors.orange },

  // Logo
  logoWrap: { width: 88, height: 88, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoOuter: { width: 88, height: 88, borderRadius: 24, backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.25)', justifyContent: 'center', alignItems: 'center' },
  logoInner: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(249,115,22,0.12)', justifyContent: 'center', alignItems: 'center' },

  // Corner accents
  corner: { position: 'absolute', width: 10, height: 10, borderColor: Colors.orange },
  cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },

  // Shimmer
  shimmer: { position: 'absolute', width: 40, height: 120, backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ rotate: '20deg' }] },

  // Text
  appName: { fontSize: 36, fontWeight: '800', color: Colors.white, letterSpacing: -0.5, textAlign: 'center' },
  appNameAccent: { color: Colors.orange },

  // Decorative line
  lineWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20, gap: 4 },
  lineFade: { width: 20, height: 1, backgroundColor: 'rgba(249,115,22,0.15)' },
  lineCenter: { width: 16, height: 1.5, backgroundColor: 'rgba(249,115,22,0.4)' },
  lineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.orange },

  // Slogan
  slogan: { fontSize: 13, color: 'rgba(249,115,22,0.7)', letterSpacing: 4, textAlign: 'center', fontWeight: '600' },
  tagline: { fontSize: 15, color: Colors.slate400, textAlign: 'center', fontWeight: '400' },

  // Flags
  flagsContainer: { position: 'absolute', bottom: 110, alignItems: 'center', width: '100%' },
  flagItem: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.3)' },
  flagEmoji: { fontSize: 22 },
  flagsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, fontWeight: '500', marginTop: 10, textTransform: 'uppercase' },

  // Bottom
  bottom: { position: 'absolute', bottom: 50, alignItems: 'center' },
  bottomLine: { width: 30, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  bottomText: { fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: 3, fontWeight: '600', marginBottom: 16 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dotActive: { backgroundColor: Colors.orange, width: 16, borderRadius: 3 },
});
