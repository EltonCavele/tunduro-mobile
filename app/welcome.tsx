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
  const { isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A carregar sessao..." />;
  }

  if (user && isVerified) {
    return <Redirect href="/(tabs)/index" />;
  }

  if (user) {
    const identifier = getPreferredIdentifier(user);
    const verifyAccountHref = identifier
      ? `/auth/verify-account?identifier=${encodeURIComponent(identifier)}`
      : '/auth/verify-account';

    return <Redirect href={verifyAccountHref} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 bg-white">
        <View className="flex-[1.35] bg-white">
          <Image className="h-full w-full" resizeMode="contain" source={START_PAGE_IMAGE} />
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
