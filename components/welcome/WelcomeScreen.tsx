import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { WelcomeContent } from './WelcomeContent';
import { WelcomeHero } from './WelcomeHero';

export function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 bg-white">
        <WelcomeHero />
        <View className="-mt-5">
          <WelcomeContent
            onCreateAccount={() => router.push('/criar-conta')}
            onEnter={() => router.replace('/(tabs)/inicio')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
