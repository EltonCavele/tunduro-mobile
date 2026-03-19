import { Tabs } from 'expo-router';
import { LayoutGrid, CalendarDays, UserRound, Bookmark } from 'lucide-react-native';

import { TabBarIcon } from 'components/navigation/TabBarIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F3125',
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {},
        sceneStyle: {
          backgroundColor: 'white',
        },
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={LayoutGrid} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={CalendarDays} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={Bookmark} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={UserRound} />
          ),
        }}
      />
    </Tabs>
  );
}
