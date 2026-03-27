import { Check } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Pressable } from 'react-native';

import type { Court } from 'lib/court.types';

import { DEFAULT_COURT_IMAGE } from './shared';

interface NewBookingCourtOptionRowProps {
  court: Court;
  isSelected: boolean;
  onPress: () => void;
}

export function NewBookingCourtOptionRow({
  court,
  isSelected,
  onPress,
}: NewBookingCourtOptionRowProps) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: court.images[0].url }
    : DEFAULT_COURT_IMAGE;

  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[24px] border px-4 py-4 ${
        isSelected ? 'border-[#1F3125] bg-[#EEF3ED]' : 'border-[#ECECEF] bg-white'
      }`}
      onPress={onPress}>
      <Image className="h-16 w-16 rounded-[18px]" resizeMode="cover" source={imageSource} />

      <View className="ml-4 flex-1">
        <Text className="text-[15px] font-semibold text-[#171717]">{court.name}</Text>
        <Text className="mt-1 text-[12px] text-[#757575]">
          {court.surface} • {court.type === 'INDOOR' ? 'Indoor' : 'Outdoor'}
        </Text>
        <Text className="mt-1 text-[11px] text-[#8A8A8A]">
          {court.pricePerHour} {court.currency}/hora • {court.maxPlayers} jogadores
        </Text>
      </View>

      {isSelected ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1F3125]">
          <Check size={16} stroke="#FFFFFF" strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}
