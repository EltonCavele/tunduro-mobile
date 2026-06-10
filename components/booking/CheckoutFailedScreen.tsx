import { Text } from 'components/app/Text';
import { useMemo } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CircleX } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';

function mapMpesaErrorToUserMessage(failureReason: string) {
  const code = failureReason.split(':')[0]?.trim();

  switch (code) {
    case 'INS-5':
      return 'Cancelaste o pagamento no telemovel.';
    case 'INS-6':
      return 'O pagamento falhou no M-Pesa. Tenta novamente.';
    case 'INS-9':
      return 'Nao confirmaste o pagamento a tempo.';
    case 'INS-2006':
      return 'Saldo M-Pesa insuficiente.';
    case 'INS-2051':
      return 'Numero M-Pesa invalido.';
    case 'INS-10':
      return 'Pagamento duplicado, tenta de novo.';
    case 'GATEWAY_ERROR':
      return 'O M-Pesa esta temporariamente indisponivel.';
    default:
      return failureReason || 'O pagamento falhou. Tenta novamente.';
  }
}

export function CheckoutFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = typeof params.reason === 'string' ? params.reason : '';
  const message = useMemo(() => mapMpesaErrorToUserMessage(reason), [reason]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-6">
        <CircleX size={68} stroke="#D15252" strokeWidth={1.8} />
        <Text className="mt-6 text-[24px] font-semibold text-[#171717]">Pagamento recusado</Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#6B6B6B]">{message}</Text>

        <Pressable
          accessibilityRole="button"
          className="mt-7 w-full max-w-[320px] items-center rounded-full bg-[#BDE111] px-5 py-3.5"
          onPress={() => router.replace('/bookings/new')}>
          <Text className="text-[14px] font-semibold text-white">Tentar novamente</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="mt-3 w-full max-w-[320px] items-center rounded-full border border-[#DADADA] px-5 py-3.5"
          onPress={() => router.replace('/')}>
          <Text className="text-[14px] font-semibold text-[#2A2A2A]">Voltar ao inicio</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
