import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.orange,
        tabBarInactiveTintColor: Colors.slate400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.slate100,
          paddingTop: 2,
          height: 75,
        },
        tabBarIconStyle: { marginBottom: -2 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '500' },
        headerStyle: { backgroundColor: Colors.white },
        headerTitleStyle: { fontWeight: '700', fontSize: 15 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={20} color={color} />,
          headerTitle: 'Rechercher',
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: 'Publier',
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={Colors.orange} />
          ),
          headerTitle: 'Publier une annonce',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={20} color={color} />,
          headerTitle: 'Mes favoris',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
          headerTitle: 'Mon profil',
        }}
      />
    </Tabs>
  );
}
