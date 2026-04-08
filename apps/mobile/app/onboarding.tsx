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
              <Ionicons name={item.icon} size={36} color={item.color} />
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
        <Ionicons name="arrow-forward" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingBottom: 40 },
  skip: { position: 'absolute', top: 56, right: 20, zIndex: 10 },
  skipText: { fontSize: 11, color: Colors.slate500 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.slate900, textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 12, color: Colors.slate500, textAlign: 'center', lineHeight: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.slate200, marginHorizontal: 3 },
  dotActive: { backgroundColor: Colors.orange, width: 18 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.orange, marginHorizontal: 20, paddingVertical: 13, borderRadius: 12, gap: 6 },
  buttonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
