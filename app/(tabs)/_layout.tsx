import { Redirect, Tabs } from 'expo-router';
import { LayoutGrid, UserRound, Bookmark, Club } from 'lucide-react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { TabBarIcon } from 'components/navigation/TabBarIcon';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

export default function TabsLayout() {
  const { hasSession, isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A validar acesso..." />;
  }

  if (!hasSession) {
    return <Redirect href="/auth/sign-in" />;
  }

  if (!isVerified) {
    const identifier = getPreferredIdentifier(user);

    return (
      <Redirect
        href={
          identifier
            ? {
                pathname: '/auth/verify-account',
                params: { identifier },
              }
            : '/auth/verify-account'
        }
      />
    );
  }

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
        name="reserve"
        options={{
          headerShown: true,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          title: 'Reservas',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={Bookmark} />
          ),
        }}
      />

      <Tabs.Screen
        name="courts"
        options={{
          headerShown: true,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          title: 'Campos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={Club} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          headerShown: true,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={UserRound} />
          ),
        }}
      />
    </Tabs>
  );
}
