import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'home-outline' as const,
    title: 'Trouvez votre bien ideal',
    description: 'Des milliers d\'annonces verifiees pour l\'achat, la vente et la location au Senegal.',
    color: Colors.orange,
  },
  {
    icon: 'search-outline' as const,
    title: 'Recherche intelligente',
    description: 'Filtrez par ville, quartier, type de bien, budget et surface pour trouver exactement ce que vous cherchez.',
    color: Colors.orangeDark,
  },
  {
    icon: 'people-outline' as const,
    title: 'Contact direct',
    description: 'Contactez les annonceurs directement par WhatsApp, telephone ou formulaire.',
    color: Colors.slate700,
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleDone = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleDone();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={handleDone}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={60} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingBottom: 50 },
  skip: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { fontSize: 15, color: Colors.slate500 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.slate900, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: Colors.slate500, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.slate200, marginHorizontal: 4 },
  dotActive: { backgroundColor: Colors.orange, width: 24 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.orange, marginHorizontal: 24, paddingVertical: 16, borderRadius: 16, gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
