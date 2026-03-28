import { useMemo } from 'react';
import { View } from 'react-native';
import { Agenda, type AgendaEntry } from 'react-native-calendars';

import type { CalendarReservation } from 'lib/calendar-bookings';

import { AgendaReservationsList } from './AgendaReservationsList';

type MarkedDay = {
  dotColor?: string;
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
};

interface CalendarWeekStripProps {
  markedDates: Record<string, MarkedDay>;
  onSelectDate: (date: string) => void;
  reservationsByDate: Record<string, CalendarReservation[]>;
  selectedDate: string;
}

interface AgendaSelectedDayLike {
  getDate: () => number;
  getFullYear: () => number;
  getMonth: () => number;
}

const CALENDAR_THEME = {
  agendaKnobColor: '#D7D4CD',
  arrowColor: '#1C1C1C',
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',
  dayTextColor: '#1C1C1C',
  monthTextColor: '#171717',
  reservationsBackgroundColor: '#FFFFFF',
  selectedDayBackgroundColor: '#BDE111',
  selectedDayTextColor: '#171717',
  textDayFontSize: 13,
  textDayFontWeight: '600',
  textDayHeaderFontSize: 10,
  textDayHeaderFontWeight: '500',
  textMonthFontSize: 15,
  textMonthFontWeight: '600',
  textSectionTitleColor: '#8B8B8B',
  todayTextColor: '#1F3125',
  'stylesheet.agenda.main': {
    reservations: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      marginTop: 96,
    },
  },
  stylesheet: {
    calendar: {
      header: {
        week: {
          marginBottom: 6,
          marginTop: 8,
        },
      },
    },
  },
} as const;

function buildAgendaItems(
  reservationsByDate: Record<string, CalendarReservation[]>,
  selectedDate: string
) {
  const items: Record<string, AgendaEntry[]> = {};

  Object.entries(reservationsByDate).forEach(([dateKey, reservations]) => {
    items[dateKey] = reservations.map((reservation) => ({
      day: dateKey,
      height: 1,
      name: reservation.title,
    }));
  });

  if (!items[selectedDate]) {
    items[selectedDate] = [];
  }

  return items;
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function getDateKeyFromAgendaSelectedDay(
  selectedDay: AgendaSelectedDayLike | undefined,
  fallbackDateKey: string
) {
  if (!selectedDay) {
    return fallbackDateKey;
  }

  return `${selectedDay.getFullYear()}-${padNumber(selectedDay.getMonth() + 1)}-${padNumber(
    selectedDay.getDate()
  )}`;
}

export function CalendarWeekStrip({
  markedDates,
  onSelectDate,
  reservationsByDate,
  selectedDate,
}: CalendarWeekStripProps) {
  const agendaItems = useMemo(
    () => buildAgendaItems(reservationsByDate, selectedDate),
    [reservationsByDate, selectedDate]
  );

  function handleSelectDate(dateString: string) {
    if (dateString !== selectedDate) {
      onSelectDate(dateString);
    }
  }

  return (
    <View className=" flex-1 rounded-t-[26px]">
      <Agenda
        firstDay={0}
        futureScrollRange={24}
        hideKnob={false}
        showClosingKnob={true}
        items={agendaItems}
        markedDates={markedDates}
        onDayPress={(date) => handleSelectDate(date.dateString)}
        pastScrollRange={24}
        renderList={(listProps) => {
          const agendaSelectedDate = getDateKeyFromAgendaSelectedDay(
            listProps.selectedDay as AgendaSelectedDayLike | undefined,
            selectedDate
          );
          const reservations = reservationsByDate[agendaSelectedDate] ?? [];

          return <AgendaReservationsList key={agendaSelectedDate} reservations={reservations} />;
        }}
        selected={selectedDate}
        showScrollIndicator={false}
        testID="calendar-agenda"
        theme={CALENDAR_THEME}
      />
    </View>
  );
}
