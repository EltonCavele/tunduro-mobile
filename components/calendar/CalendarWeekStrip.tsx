import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';
import {
  formatCalendarSelectedDateLabel,
  formatCalendarWeekdayShort,
  shiftDateKey,
} from 'lib/calendar-bookings';

import { AgendaReservationsList } from './AgendaReservationsList';

interface CalendarWeekStripProps {
  onSelectDate: (date: string) => void;
  onSelectBooking: (id: string) => void;
  reservationsByDate: Record<string, CalendarReservation[]>;
  selectedDate: string;
}

const DATE_ITEM_WIDTH = 68;
const DATE_RANGE_DAYS = 180;

export function CalendarWeekStrip({
  onSelectDate,
  onSelectBooking,
  reservationsByDate,
  selectedDate,
}: CalendarWeekStripProps) {
  const listRef = useRef<FlatList<string>>(null);
  const initialSelectedDateRef = useRef(selectedDate);
  const dateKeys = useMemo(
    () =>
      Array.from({ length: DATE_RANGE_DAYS * 2 + 1 }, (_, index) =>
        shiftDateKey(initialSelectedDateRef.current, index - DATE_RANGE_DAYS)
      ),
    []
  );
  const selectedIndex = dateKeys.indexOf(selectedDate);
  const reservations = reservationsByDate[selectedDate] ?? [];

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }

    listRef.current?.scrollToIndex({
      animated: true,
      index: selectedIndex,
      viewPosition: 0.5,
    });
  }, [selectedIndex]);

  function handleSelectDate(dateString: string) {
    if (dateString !== selectedDate) {
      onSelectDate(dateString);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-[#F1F1F1] px-5 pb-4 pt-4">
        <View>
          <FlatList
            ref={listRef}
            className="flex-grow-0"
            data={dateKeys}
            getItemLayout={(_, index) => ({
              index,
              length: DATE_ITEM_WIDTH,
              offset: DATE_ITEM_WIDTH * index,
            })}
            horizontal
            initialScrollIndex={selectedIndex >= 0 ? selectedIndex : DATE_RANGE_DAYS}
            keyExtractor={(item) => item}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item: dateKey }) => {
              const isSelected = dateKey === selectedDate;
              const hasReservations = (reservationsByDate[dateKey] ?? []).length > 0;

              return (
                <Pressable
                  accessibilityRole="button"
                  className={`mx-1 items-center rounded-[18px] px-2 py-3 ${
                    isSelected ? 'bg-[#BDE111]' : 'bg-white'
                  }`}
                  onPress={() => handleSelectDate(dateKey)}
                  style={{ width: DATE_ITEM_WIDTH - 8 }}>
                  <Text
                    className={`text-[12px] ${isSelected ? 'text-[#171717]' : 'text-[#A2A2A2]'}`}>
                    {formatCalendarWeekdayShort(dateKey)}
                  </Text>
                  <Text
                    className={`mt-1 text-[22px] ${
                      isSelected ? 'text-[#171717]' : 'text-[#2A2A2A]'
                    }`}>
                    {dateKey.slice(-2)}
                  </Text>
                  <View
                    className={`mt-2 h-1.5 w-1.5 rounded-full ${
                      hasReservations ? 'bg-[#171717]' : 'bg-transparent'
                    }`}
                  />
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <Text className="mt-4 text-center text-[16px] text-[#9A9A9A]">
          {formatCalendarSelectedDateLabel(selectedDate)}
        </Text>
      </View>

      <AgendaReservationsList reservations={reservations} onSelectBooking={onSelectBooking} />
    </View>
  );
}
