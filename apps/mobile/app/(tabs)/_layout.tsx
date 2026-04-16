import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useI18n } from '../../lib/i18n';

export default function TabLayout() {
  const { t } = useI18n();

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
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.home'),
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tab.search'),
          tabBarIcon: ({ color }) => <Ionicons name="search" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: t('tab.publish'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={Colors.orange} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tab.favorites'),
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab.profile'),
          tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
