import { Text } from 'components/app/Text';
import { Pressable, ScrollView, View } from 'react-native';

import type { Court } from 'lib/court.types';

interface CourtScheduleTabsProps {
  courts: Court[];
  selectedCourtId: string;
  onSelectCourt: (courtId: string) => void;
}

export function CourtScheduleTabs({
  courts,
  selectedCourtId,
  onSelectCourt,
}: CourtScheduleTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      className="grow-0 ">
      {courts.map((court) => {
        const isSelected = court.id === selectedCourtId;

        return (
          <Pressable
            key={court.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className="px-4 pt-4"
            onPress={() => onSelectCourt(court.id)}>
            <Text
              className={`text-[15px] ${
                isSelected ? 'font-title text-primary' : 'text-[#3C5424]'
              }`}>
              {court.name}
            </Text>
            <View
              className={`mt-2 h-[3px] rounded-full ${
                isSelected ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
