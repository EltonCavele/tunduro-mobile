import { Image, View } from 'react-native';

const START_PAGE_IMAGE = require('../../assets/imgs/startpage.png');

export function WelcomeHero() {
  return (
    <View className="flex-[1.35] bg-white">
      <Image
        className="h-full w-full"
        resizeMode="cover"
        source={START_PAGE_IMAGE}
      />
    </View>
  );
}
