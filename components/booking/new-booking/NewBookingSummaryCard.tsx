import { Image, Text, View } from 'react-native';
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

export function NewBookingSummaryCard({
  court,
  dateKey,
  rangeLabel,
}: NewBookingSummaryCardProps) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: getCourtImageUrl(court.images[0].url) }
    : DEFAULT_COURT_IMAGE;

  return (
    <View className="rounded-[28px] bg-[#F1F1F3] px-5 py-5">
      <View className="flex-row">
        <Image className="h-24 w-24 rounded-[24px]" resizeMode="cover" source={imageSource} />

        <View className="ml-4 flex-1 justify-center">
          <Text className="text-[17px] font-semibold text-[#171717]">{court.name}</Text>
          <Text className="mt-1 text-[14px] text-[#5A5A5A]">{rangeLabel}</Text>
          <Text className="mt-1 text-[12px] text-[#878787]">
            {formatReservationDateLabel(dateKey)}
          </Text>
        </View>
      </View>
    </View>
  );
}
