import { Pressable, Text, View } from 'react-native';
import { type DateData } from 'react-native-calendars';
import Week from 'react-native-calendars/src/expandableCalendar/week';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

type WeekDayCellProps = {
  date?: DateData;
  marking?: MarkedDay;
  onPress?: (date?: DateData) => void;
};

function getWeekDayIndex(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day).getDay();
}

function WeekDayCell({ date, marking, onPress }: WeekDayCellProps) {
  if (!date) {
    return null;
  }

  const isSelected = Boolean(marking?.selected);
  const isMarked = Boolean(marking?.marked);
  const weekDayLabel = WEEKDAY_LABELS[getWeekDayIndex(date.dateString)];

  return (
    <Pressable
      className="items-center"
      onPress={() => onPress?.(date)}
      style={{ width: 44 }}
    >
      <Text
        className="text-[12px] font-medium"
        style={{ color: isSelected ? '#FF7A33' : '#8B8B8B' }}
      >
        {weekDayLabel}
      </Text>

      <View
        className="mt-2 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: isSelected ? '#FF7A33' : '#EAE8E3' }}
      >
        <Text
          className="text-[16px] font-semibold"
          style={{ color: isSelected ? '#FFFFFF' : '#1C1C1C' }}
        >
          {String(date.day).padStart(2, '0')}
        </Text>
      </View>

      <View
        className="mt-1.5 h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isMarked
            ? isSelected
              ? '#FFFFFF'
              : marking?.dotColor || '#1F3125'
            : 'transparent',
        }}
      />
    </Pressable>
  );
}

export function CalendarWeekStrip({
  markedDates,
  onSelectDate,
  selectedDate,
}: CalendarWeekStripProps) {
  return (
    <View className="mt-6">
      <Week
        current={selectedDate}
        dayComponent={WeekDayCell}
        firstDay={0}
        markedDates={markedDates}
        onDayPress={(date) => onSelectDate(date.dateString)}
        testID="calendar-week"
        theme={{
          backgroundColor: '#F6F4EF',
          calendarBackground: '#F6F4EF',
        }}
      />
    </View>
  );
}
