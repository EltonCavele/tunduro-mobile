import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { AddReservationButton } from './AddReservationButton';
import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekStrip } from './CalendarWeekStrip';
import { DayScheduleHeader } from './DayScheduleHeader';
import {
  adaptBookingsResponse,
  buildMarkedDates,
  formatScheduleHeading,
  getTodayDateKey,
  groupReservationsByDate,
  isPastDateKey,
  mockBookingsResponse,
  shiftDateKey,
} from 'lib/calendar-bookings';

const reservationsByDate = groupReservationsByDate(adaptBookingsResponse(mockBookingsResponse));

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());

  const reservations = reservationsByDate[selectedDate] ?? [];
  const markedDates = buildMarkedDates(reservationsByDate, selectedDate);
  const showAddReservationButton = !isPastDateKey(selectedDate);

  return (
    <SafeAreaView className="flex-1">
      <View className="px-5 pb-5 pt-3">
        <CalendarHeader />

        <DayScheduleHeader
          onNextDay={() => setSelectedDate(shiftDateKey(selectedDate, 1))}
          onPreviousDay={() => setSelectedDate(shiftDateKey(selectedDate, -1))}
          reservationCount={reservations.length}
          title={formatScheduleHeading(selectedDate)}
        />

        {showAddReservationButton ? <AddReservationButton /> : null}
      </View>

      <CalendarWeekStrip
        markedDates={markedDates}
        onSelectDate={setSelectedDate}
        reservationsByDate={reservationsByDate}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
}
