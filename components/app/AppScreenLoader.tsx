import { Text, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';

import { SafeAreaView } from 'components/app/SafeAreaView';

interface AppScreenLoaderProps {
  message?: string;
}

export function AppScreenLoader({ message = 'A carregar...' }: AppScreenLoaderProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <LoadingIndicator size="large" />
        <Text className="mt-4 text-center text-[14px] text-[#4C4C4C]">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
