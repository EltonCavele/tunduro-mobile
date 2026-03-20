import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';
import { ExpandableCalendar } from 'react-native-calendars';

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
  selectedDate: string;
}

const CALENDAR_THEME = {
  arrowColor: '#1C1C1C',
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',
  dayTextColor: '#1C1C1C',
  monthTextColor: '#171717',
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

export function CalendarWeekStrip({
  markedDates,
  onSelectDate,
  selectedDate,
}: CalendarWeekStripProps) {
  return (
    <View className="mt-6 overflow-hidden rounded-[26px] bg-white">
      <ExpandableCalendar
        allowShadow={false}
        closeOnDayPress={false}
        current={selectedDate}
        disableWeekScroll={false}
        firstDay={0}
        futureScrollRange={24}
        hideKnob={false}
        initialPosition={ExpandableCalendar.positions.CLOSED}
        markedDates={markedDates}
        onDayPress={(date) => onSelectDate(date.dateString)}
        pastScrollRange={24}
        renderArrow={(direction) =>
          direction === 'left' ? (
            <ChevronLeft size={18} stroke="#1C1C1C" strokeWidth={2.4} />
          ) : (
            <ChevronRight size={18} stroke="#1C1C1C" strokeWidth={2.4} />
          )
        }
        testID="calendar-expandable"
        theme={CALENDAR_THEME}
      />
    </View>
  );
}
