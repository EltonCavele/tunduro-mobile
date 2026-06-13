import { useEffect } from 'react';

import { Tabs, useRouter } from 'expo-router';
import { Home, UserRound, CalendarCheck, LandPlot } from 'lucide-react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { TabBarIcon } from 'components/navigation/TabBarIcon';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';
import { typography } from 'lib/typography';

export default function TabsLayout() {
  const router = useRouter();
  const { hasSession, isLoading, isVerified, user } = useAuthStatus();
  const identifier = getPreferredIdentifier(user);
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasSession) {
      router.replace('/auth/sign-in');
      return;
    }

    if (!isVerified) {
      const verifyAccountHref = identifier
        ? `/auth/verify-account?identifier=${encodeURIComponent(identifier)}`
        : '/auth/verify-account';

      router.replace(verifyAccountHref);
    }
  }, [hasSession, identifier, isLoading, isVerified, router]);

  if (isLoading) {
    return <AppScreenLoader message="A validar acesso..." />;
  }

  if (!hasSession || !isVerified) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1B3022',
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarHideOnKeyboard: true,
        headerBackTitleStyle: {
          fontFamily: typography.label,
        },
        headerTitleStyle: {
          fontFamily: typography.titleBold,
        },
        tabBarStyle: {
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#EFEFEF',
        },
        tabBarLabelStyle: {
          fontFamily: typography.button,
        },
        sceneStyle: {
          backgroundColor: 'white',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} icon={Home} />
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
            <TabBarIcon color={color} focused={focused} icon={CalendarCheck} />
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
            <TabBarIcon color={color} focused={focused} icon={LandPlot} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
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
