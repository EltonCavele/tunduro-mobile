import { Bell } from 'lucide-react-native';
import { Image, View } from 'react-native';

export function HomeHeader() {
  return (
    <View className="flex-row items-start justify-between">
      <Image
        source={{
          uri: 'https://ui-avatars.com/api/?name=elton+carlos&font-size=0.33',
        }}
        className="h-12 w-12 overflow-hidden  rounded-full bg-white "
        resizeMode="cover"
      />

      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary ">
        <Bell size={20} stroke="black" />
      </View>
    </View>
  );
}
