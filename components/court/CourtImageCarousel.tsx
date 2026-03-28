import { useMemo, useState } from 'react';

import type { ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Image, ScrollView, Text, View } from 'react-native';

import { DEFAULT_COURT_IMAGE } from 'components/booking/new-booking/shared';
import type { CourtImage } from 'lib/court.types';

interface CourtImageCarouselProps {
  height: number;
  images: CourtImage[];
  label: string;
  width: number;
}

export function CourtImageCarousel({
  height,
  images,
  label,
  width,
}: CourtImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageSources = useMemo<ImageSourcePropType[]>(() => {
    const sortedImages = [...images]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((image) => image.url?.trim())
      .filter(Boolean)
      .map((url) => ({ uri: url }));

    return sortedImages.length > 0 ? sortedImages : [DEFAULT_COURT_IMAGE];
  }, [images]);

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), imageSources.length - 1));
  }

  return (
    <View className="relative overflow-hidden rounded-[30px]" style={{ height, width }}>
      <ScrollView
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={handleMomentumScrollEnd}
        pagingEnabled
        showsHorizontalScrollIndicator={false}>
        {imageSources.map((source, index) => (
          <Image
            key={`${label}-${index}`}
            resizeMode="cover"
            source={source}
            style={{ height, width }}
          />
        ))}
      </ScrollView>

      <View className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2">
        <Text className="text-[13px] text-[#222222]">{label}</Text>
      </View>

      <View className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2">
        <Text className="text-[13px] text-[#222222]">
          {activeIndex + 1}/{imageSources.length}
        </Text>
      </View>
    </View>
  );
}
