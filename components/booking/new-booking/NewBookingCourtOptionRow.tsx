import { Text } from 'components/app/Text';
import { Check } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import type { Role } from 'lib/auth.types';
import { getBookingHourlyPrice } from 'lib/booking-pricing';
import type { Court } from 'lib/court.types';
import { formatCourtPrice, getCourtImageUrl } from 'lib/court-utils';

import { DEFAULT_COURT_IMAGE } from './shared';

interface NewBookingCourtOptionRowProps {
  court: Court;
  isSelected: boolean;
  onPress: () => void;
  role?: Role | null;
}

export function NewBookingCourtOptionRow({
  court,
  isSelected,
  onPress,
  role,
}: NewBookingCourtOptionRowProps) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: getCourtImageUrl(court.images[0].url) }
    : DEFAULT_COURT_IMAGE;
  const hourlyPrice = getBookingHourlyPrice(court, role);

  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[24px] border px-4 py-4 ${
        isSelected ? 'border-[#BDE111] bg-[#EEF3ED]' : 'border-[#ECECEF] bg-white'
      }`}
      onPress={onPress}>
      <Image className="h-[72px] w-[72px] rounded-[18px]" resizeMode="cover" source={imageSource} />

      <View className="ml-4 flex-1">
        <Text className="text-[17px] font-semibold text-[#171717]">{court.name}</Text>
        <Text className="mt-1 text-[14px] text-[#757575]">
          {court.surface} • {court.type === 'INDOOR' ? 'Indoor' : 'Outdoor'}
        </Text>
        <Text className="mt-1 text-[14px] text-[#6D6D6D]">
          {formatCourtPrice(hourlyPrice, court.currency)}/hora • {court.maxPlayers} jogadores
        </Text>
      </View>

      {isSelected ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#BDE111]">
          <Check size={16} stroke="#FFFFFF" strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}
