import { Text } from 'components/app/Text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clock3 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';

export function CheckoutExpiredScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-6">
        <Clock3 size={68} stroke="#7E7E7E" strokeWidth={1.8} />
        <Text className="mt-6 text-[24px] font-semibold text-[#171717]">Tempo esgotado</Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#6B6B6B]">
          Nao recebemos a confirmacao do pagamento a tempo. O slot foi libertado.
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-7 w-full max-w-[320px] items-center rounded-full bg-[#BDE111] px-5 py-3.5"
          onPress={() => router.replace('/bookings/new')}>
          <Text className="text-[14px] font-semibold text-white">Reservar novamente</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
