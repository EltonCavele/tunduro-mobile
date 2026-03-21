import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { AddReservationButton } from './AddReservationButton';
import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekStrip } from './CalendarWeekStrip';
import {
  adaptBookingsResponse,
  buildMarkedDates,
  getTodayDateKey,
  groupReservationsByDate,
  isPastDateKey,
  mockBookingsResponse,
} from 'lib/calendar-bookings';

const reservationsByDate = groupReservationsByDate(adaptBookingsResponse(mockBookingsResponse));

export function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());

  const markedDates = buildMarkedDates(reservationsByDate, selectedDate);
  const showAddReservationButton = !isPastDateKey(selectedDate);

  return (
    <SafeAreaView className="flex-1">
      <View className="px-5 pb-5 pt-3">
        <CalendarHeader selectedDate={selectedDate} />
      </View>

      <CalendarWeekStrip
        markedDates={markedDates}
        onSelectDate={setSelectedDate}
        reservationsByDate={reservationsByDate}
        selectedDate={selectedDate}
      />

      {showAddReservationButton ? (
        <View
          pointerEvents="box-none"
          className="absolute right-5"
          style={{ bottom: Math.max(insets.bottom, 16) + 20 }}>
          <AddReservationButton />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
