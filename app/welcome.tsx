import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { WelcomeContent } from 'components/welcome/WelcomeContent';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

const START_PAGE_IMAGE = require('../assets/imgs/startpage.png');

export default function WelcomeRoute() {
  const router = useRouter();
  const { hasSession, isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A carregar sessao..." />;
  }

  if (hasSession && isVerified) {
    return <Redirect href="/(tabs)/inicio" />;
  }

  if (hasSession) {
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 bg-white">
        <View className="flex-[1.35] bg-white">
          <Image className="h-full w-full" resizeMode="cover" source={START_PAGE_IMAGE} />

          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.82)', 'rgba(255,255,255,1)']}
            locations={[0.4, 0.78, 1]}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 220,
            }}
          />
        </View>

        <View className="-mt-5">
          <WelcomeContent
            onCreateAccount={() => router.replace('/auth/sign-up')}
            onEnter={() => router.replace('/auth/sign-in')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
