import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppScreenLoaderProps {
  message?: string;
}

export function AppScreenLoader({ message = 'A carregar...' }: AppScreenLoaderProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#1F3125" size="small" />
        <Text className="mt-4 text-center text-[14px] text-[#4C4C4C]">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
