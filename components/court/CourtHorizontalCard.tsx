import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { CourtImageCarousel } from 'components/court/CourtImageCarousel';
import type { Court } from 'lib/court.types';
import {
  formatCourtCapacity,
  formatCourtLighting,
  formatCourtPrice,
  formatCourtRating,
  formatCourtTypeLabel,
} from 'lib/court-utils';

interface CourtHorizontalCardProps {
  court: Court;
}

export function CourtHorizontalCard({ court }: CourtHorizontalCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(width - 40, 280);
  const handleOpenDetails = () => router.push(`/courts/${court.id}`);

  return (
    <Pressable accessibilityRole="button" className="bg-white" onPress={handleOpenDetails}>
      <CourtImageCarousel
        height={320}
        images={court.images}
        label={formatCourtTypeLabel(court.type)}
        width={contentWidth}
      />

      <View className="px-1 pb-1 pt-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[22px] text-[#161616]">{court.name}</Text>
            <Text className="mt-3 text-[13px] text-[#8A8A8A]">
              {court.surface} • {formatCourtCapacity(court.maxPlayers)}
            </Text>
            <Text className="mt-1 text-[13px] text-[#8A8A8A]">
              {formatCourtLighting(court.hasLighting)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[13px] text-[#8A8A8A]">Avaliacao</Text>
            <Text className="mt-1 text-[17px] text-[#161616]">
              {formatCourtRating(court.ratingAverage, court.ratingCount)}
            </Text>
          </View>
        </View>

        <View className="mt-6 flex-row items-end justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[20px] text-[#161616]">
              {formatCourtPrice(court.pricePerHour, court.currency)}
            </Text>
            <Text className="mt-1 text-[12px] text-[#9B9B9B]">por hora</Text>
          </View>

          <View className="flex-1">
            <Button
              className="rounded-2xl bg-primary"
              feedbackVariant="none"
              size="md"
              onPress={(event) => {
                event.stopPropagation?.();
                router.push({
                  pathname: '/bookings/new',
                  params: { courtId: court.id },
                });
              }}>
              <Button.Label className="text-[16px] text-black">Reservar</Button.Label>
            </Button>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
