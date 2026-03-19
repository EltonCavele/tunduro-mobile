import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekStrip } from './CalendarWeekStrip';
import { DayScheduleHeader } from './DayScheduleHeader';
import { ReservationsTimeline } from './ReservationsTimeline';
import {
  adaptBookingsResponse,
  buildMarkedDates,
  formatScheduleHeading,
  getTodayDateKey,
  groupReservationsByDate,
  mockBookingsResponse,
  shiftDateKey,
} from 'lib/calendar-bookings';

const reservationsByDate = groupReservationsByDate(
  adaptBookingsResponse(mockBookingsResponse)
);

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());

  const reservations = reservationsByDate[selectedDate] ?? [];
  const markedDates = buildMarkedDates(reservationsByDate, selectedDate);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F4EF]">
      <View className="px-5 pb-5 pt-3">
        <CalendarHeader />

        <CalendarWeekStrip
          markedDates={markedDates}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />

        <DayScheduleHeader
          onNextDay={() => setSelectedDate(shiftDateKey(selectedDate, 1))}
          onPreviousDay={() => setSelectedDate(shiftDateKey(selectedDate, -1))}
          reservationCount={reservations.length}
          title={formatScheduleHeading(selectedDate)}
        />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ReservationsTimeline reservations={reservations} />
      </ScrollView>
    </SafeAreaView>
  );
}
