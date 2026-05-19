import { Text } from 'components/app/Text';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { CalendarWeekStrip } from './CalendarWeekStrip';
import {
  adaptBookingsToCalendarReservations,
  getTodayDateKey,
  groupReservationsByDate,
} from 'lib/calendar-bookings';
import { getErrorMessage } from 'lib/error-utils';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';

import { BookingDetailsSheet } from 'components/booking/BookingDetailsSheet';

function CalendarLoadingState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <LoadingIndicator size="large" />
      <Text className="mt-4 text-center text-[14px] text-[#6F6F6F]">
        A carregar as tuas reservas.
      </Text>
    </View>
  );
}

function CalendarErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-full max-w-[320px] rounded-[28px] bg-white px-6 py-8">
        <Text className="text-center text-[18px] font-semibold text-[#171717]">
          Nao foi possivel carregar as reservas
        </Text>
        <Text className="mt-3 text-center text-[13px] leading-5 text-[#787878]">{message}</Text>

        <Pressable
          accessibilityRole="button"
          className="mt-6 items-center rounded-full bg-[#1F3125] px-5 py-3"
          onPress={onRetry}>
          <Text className="text-[14px] font-semibold text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CalendarScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const { data: bookings = [], error, isError, isLoading, isRefetching, refetch } = useMyBookingsQuery();
  const todayDateKey = getTodayDateKey();
  const isTodaySelected = selectedDate === todayDateKey;
  const isRefreshing = isRefetching && !isLoading;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'left',
      headerRight: () => (
        <Pressable
          accessibilityHint="Abre o formulario para criar uma nova reserva"
          accessibilityLabel="Adicionar reserva"
          accessibilityRole="button"
          className="mr-4 rounded-full bg-[#1F3125] p-2"
          onPress={() =>
            router.push({
              pathname: '/bookings/new',
              params: { date: selectedDate },
            })
          }>
          <Plus size={18} stroke="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      ),
    });
  }, [navigation, router, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(getTodayDateKey());
    }, [])
  );

  const reservationsByDate = useMemo(
    () => groupReservationsByDate(adaptBookingsToCalendarReservations(bookings)),
    [bookings]
  );

  const errorMessage = getErrorMessage(error, 'Tenta novamente dentro de alguns instantes.');

  if (isLoading) {
    return (
      <SafeAreaView edges={['right', 'left']} className="flex-1">
        <CalendarLoadingState />
      </SafeAreaView>
    );
  }

  if (isError && bookings.length === 0) {
    return (
      <SafeAreaView edges={['right', 'left']} className="flex-1">
        <CalendarErrorState message={errorMessage} onRetry={() => void refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1">
      <CalendarWeekStrip
        isRefreshing={isRefreshing}
        onRefresh={() => void refetch()}
        onSelectDate={setSelectedDate}
        onSelectBooking={setSelectedBookingId}
        reservationsByDate={reservationsByDate}
        selectedDate={selectedDate}
      />
      {!isTodaySelected ? (
        <Pressable
          accessibilityHint="Seleciona novamente o dia de hoje no calendario"
          accessibilityLabel="Voltar para hoje"
          accessibilityRole="button"
          className="absolute bottom-6 right-5 rounded-full border border-[#2D4A37] bg-[#1F3125] px-5 py-3.5 shadow-sm"
          onPress={() => setSelectedDate(getTodayDateKey())}>
          <Text className="text-[13px] font-semibold text-white">Voltar para hoje</Text>
        </Pressable>
      ) : null}
      <BookingDetailsSheet
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
      />
    </SafeAreaView>
  );
}
