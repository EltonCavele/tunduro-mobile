import { Text } from 'components/app/Text';
import { Image, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { formatReservationDateLabel } from 'lib/booking-reservation';
import type { Court } from 'lib/court.types';

import { DEFAULT_COURT_IMAGE } from './shared';
import { getCourtImageUrl } from 'lib/court-utils';

interface NewBookingSummaryCardProps {
  court: Court;
  dateKey: string;
  rangeLabel: string;
}

export function NewBookingSummaryCard({ court, dateKey, rangeLabel }: NewBookingSummaryCardProps) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: getCourtImageUrl(court.images[0].url) }
    : DEFAULT_COURT_IMAGE;

  return (
    <View className="rounded-xl bg-[#F1F1F3] px-3 py-3">
      <View className="flex-row">
        <Image className="h-12 w-12 rounded-xl" resizeMode="cover" source={imageSource} />

        <View className="ml-4 flex-1 justify-center">
          <Text className="text-md font-semibold text-[#171717]">{court.name}</Text>
          <View className="flex-row items-center  justify-between">
            <Text className="mt-1 text-sm text-[#5A5A5A]">{rangeLabel}</Text>
            <Text className="mt-1 text-xs text-[#7A7A7A]">
              {formatReservationDateLabel(dateKey)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
