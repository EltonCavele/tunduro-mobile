import { Text } from 'components/app/Text';
import { useMemo } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useBookingDetailsQuery } from 'hooks/useBookingDetailsQuery';
import {
  formatReservationDateLabel,
  formatTimeRangeLabel,
  getClubDateKey,
} from 'lib/booking-reservation';
import { getErrorMessage } from 'lib/error-utils';

function formatCurrencyValue(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency || 'MZN',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'MZN'}`;
  }
}

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = typeof params.id === 'string' ? params.id.trim() : '';
  const bookingQuery = useBookingDetailsQuery(bookingId, { enabled: Boolean(bookingId) });
  const booking = bookingQuery.data;

  const errorMessage = useMemo(
    () => getErrorMessage(bookingQuery.error, 'Não foi possível carregar os detalhes da reserva.'),
    [bookingQuery.error]
  );

  if (!bookingId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[24px] font-semibold text-[#171717]">Reserva inválida</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bookingQuery.isLoading || !booking) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <LoadingIndicator size="large" />
          <Text className="mt-4 text-[14px] text-[#6B6B6B]">A carregar reserva...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bookingQuery.isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] leading-6 text-[#A54D4D]">{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center rounded-full bg-[#BDE111] px-5 py-3.5"
            onPress={() => void bookingQuery.refetch()}>
            <Text className="text-[14px] font-semibold text-[#171717]">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-6">
        <CheckCircle2 size={68} stroke="#BDE111" strokeWidth={1.8} />
        <Text className="mt-6 text-[24px] font-semibold text-[#171717]">Reserva confirmada!</Text>
        <Text className="mt-2 text-center text-[14px] leading-6 text-[#6B6B6B]">
          Está tudo certo. Mostra esta reserva quando chegares ao clube.
        </Text>

        <View className="mt-6 w-full max-w-[340px] rounded-3xl bg-[#F4F6F3] px-5 py-5">
          <Text className="text-center font-title text-[15px] text-[#171717]">
            {formatReservationDateLabel(getClubDateKey(booking.startAt))}
          </Text>
          <Text className="mt-1 text-center text-[14px] text-[#2F2F2F]">
            {formatTimeRangeLabel(booking.startAt, booking.endAt)}
          </Text>
          <View className="my-3 h-px bg-[#E2E6DF]" />
          <Text className="text-center text-[14px] text-[#2F2F2F]">
            Total pago: {formatCurrencyValue(booking.totalPrice, booking.currency)}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="mt-7 w-full max-w-[320px] items-center rounded-full bg-[#BDE111] px-5 py-3.5"
          onPress={() => router.replace('/(tabs)/reserve')}>
          <Text className="text-[14px] font-semibold text-[#171717]">Ver as minhas reservas</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="mt-3 w-full max-w-[320px] items-center rounded-full border border-[#DADADA] px-5 py-3.5"
          onPress={() => router.replace('/bookings/new')}>
          <Text className="text-[14px] font-semibold text-[#2A2A2A]">Fazer outra reserva</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
