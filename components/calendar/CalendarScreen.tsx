import { ScrollView, View } from 'react-native';
import { CalendarProvider } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { AddReservationButton } from './AddReservationButton';
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
    <SafeAreaView className="flex-1 ">
      <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate}>
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

          {showAddReservationButton ? <AddReservationButton /> : null}
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}>
          <ReservationsTimeline reservations={reservations} />
        </ScrollView>
      </CalendarProvider>
    </SafeAreaView>
  );
}
