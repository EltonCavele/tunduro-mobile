import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WelcomeContent } from 'components/welcome/WelcomeContent';

const START_PAGE_IMAGE = require('../assets/imgs/startpage.png');

export default function WelcomeRoute() {
  const router = useRouter();

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
            onCreateAccount={() => router.push('/criar-conta')}
            onEnter={() => router.replace('/(tabs)/inicio')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
