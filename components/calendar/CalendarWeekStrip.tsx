import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { Agenda, type AgendaEntry } from 'react-native-calendars';

import type { CalendarReservation } from 'lib/calendar-bookings';

import { ReservationsTimeline } from './ReservationsTimeline';

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

const CALENDAR_THEME = {
  agendaKnobColor: '#D7D4CD',
  arrowColor: '#1C1C1C',
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',
  dayTextColor: '#1C1C1C',
  monthTextColor: '#171717',
  reservationsBackgroundColor: '#FFFFFF',
  selectedDayBackgroundColor: '#FF7A33',
  selectedDayTextColor: '#FFFFFF',
  textDayFontSize: 13,
  textDayFontWeight: '600',
  textDayHeaderFontSize: 10,
  textDayHeaderFontWeight: '500',
  textMonthFontSize: 15,
  textMonthFontWeight: '600',
  textSectionTitleColor: '#8B8B8B',
  todayTextColor: '#FF7A33',
  'stylesheet.agenda.list': {
    day: {
      marginTop: 0,
      width: 0,
    },
    dayNum: {
      fontSize: 0,
    },
    dayText: {
      fontSize: 0,
      marginTop: 0,
    },
  },
  'stylesheet.agenda.main': {
    reservations: {
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
  const selectedReservations = reservationsByDate[selectedDate] ?? [];

  function handleSelectDate(dateString: string) {
    if (dateString !== selectedDate) {
      onSelectDate(dateString);
    }
  }

  return (
    <View className="mt-2 flex-1 overflow-hidden rounded-t-[26px] bg-white">
      <Agenda
        firstDay={0}
        futureScrollRange={24}
        hideKnob={false}
        items={agendaItems}
        markedDates={markedDates}
        onDayPress={(date) => handleSelectDate(date.dateString)}
        pastScrollRange={24}
        renderArrow={(direction) =>
          direction === 'left' ? (
            <ChevronLeft size={18} stroke="#1C1C1C" strokeWidth={2.4} />
          ) : (
            <ChevronRight size={18} stroke="#1C1C1C" strokeWidth={2.4} />
          )
        }
        renderList={() => (
          <ScrollView
            className="flex-1 px-5"
            contentContainerClassName="pb-10"
            showsVerticalScrollIndicator={false}>
            <ReservationsTimeline reservations={selectedReservations} />
          </ScrollView>
        )}
        selected={selectedDate}
        showScrollIndicator={false}
        testID="calendar-agenda"
        theme={CALENDAR_THEME}
      />
    </View>
  );
}
