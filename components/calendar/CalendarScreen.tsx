import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { CalendarWeekStrip } from './CalendarWeekStrip';
import {
  adaptBookingsToCalendarReservations,
  getTodayDateKey,
  groupReservationsByDate,
} from 'lib/calendar-bookings';
import { getErrorMessage } from 'lib/error-utils';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';

function CalendarLoadingState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <ActivityIndicator color="#FF7A33" size="large" />
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
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const { data: bookings = [], error, isError, isLoading, refetch } = useMyBookingsQuery();

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
        onSelectDate={setSelectedDate}
        reservationsByDate={reservationsByDate}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
}
