import { Text } from 'components/app/Text';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { buildCourtScheduleDayChips, formatScheduleWeekRangeLabel } from 'lib/court-schedule';

interface CourtScheduleWeekBarProps {
  weekKeys: string[];
  selectedDate: string;
  todayKey: string;
  datesWithReservations: Set<string>;
  onSelectDate: (dateKey: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function CourtScheduleWeekBar({
  weekKeys,
  selectedDate,
  todayKey,
  datesWithReservations,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
}: CourtScheduleWeekBarProps) {
  const dayChips = buildCourtScheduleDayChips(weekKeys, todayKey);

  return (
    <View className="border-b border-[#EFEFEF] bg-white px-3 pb-3 pt-3">
      <View className="mb-2 flex-row items-center justify-between px-1">
        <Pressable
          accessibilityLabel="Semana anterior"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F4]"
          hitSlop={6}
          onPress={onPreviousWeek}>
          <ChevronLeft color="#171717" size={20} strokeWidth={2.2} />
        </Pressable>

        <Text className="font-title text-[14px] text-[#171717]">
          {formatScheduleWeekRangeLabel(weekKeys)}
        </Text>

        <Pressable
          accessibilityLabel="Proxima semana"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F4]"
          hitSlop={6}
          onPress={onNextWeek}>
          <ChevronRight color="#171717" size={20} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View className="flex-row">
        {dayChips.map((chip) => {
          const isSelected = chip.dateKey === selectedDate;
          const isToday = chip.dateKey === todayKey;
          const hasReservations = datesWithReservations.has(chip.dateKey);

          return (
            <Pressable
              key={chip.dateKey}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className="flex-1 items-center"
              onPress={() => onSelectDate(chip.dateKey)}>
              <Text
                className={`text-[11px] ${
                  isSelected ? 'text-[#3C5424]' : isToday ? 'text-[#3C5424]' : 'text-[#A2A2A2]'
                }`}>
                {chip.topLabel}
              </Text>

              <View
                className={`mt-1.5 h-10 w-10 items-center justify-center rounded-full ${
                  isSelected ? 'bg-primary' : 'bg-transparent'
                }`}>
                <Text
                  className={`text-[16px] ${
                    isSelected ? 'font-title text-[#171717]' : 'text-[#2A2A2A]'
                  }`}>
                  {chip.dayNumber}
                </Text>
              </View>

              <View
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  hasReservations ? 'bg-[#E0533D]' : 'bg-transparent'
                }`}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
