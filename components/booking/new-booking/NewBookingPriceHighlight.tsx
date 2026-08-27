import { Text } from 'components/app/Text';
import { View } from 'react-native';

import type { Role } from 'lib/auth.types';
import { getBookingHourlyPrice } from 'lib/booking-pricing';
import type { Court } from 'lib/court.types';
import { formatCourtPrice } from 'lib/court-utils';

interface NewBookingPriceHighlightProps {
  court: Court;
  lightingRequested?: boolean;
  rangeLabel?: string;
  role?: Role | null;
  startAt?: string;
  totalLabel?: string | null;
}

export function NewBookingPriceHighlight({
  court,
  lightingRequested = false,
  rangeLabel,
  role,
  startAt,
  totalLabel,
}: NewBookingPriceHighlightProps) {
  const hourlyPrice = getBookingHourlyPrice(court, role, lightingRequested, startAt);
  const hourlyLabel = hourlyPrice === 0 ? 'Grátis' : formatCourtPrice(hourlyPrice, court.currency);
  const hasTotal = Boolean(totalLabel);

  return (
    <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-primary px-4 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-[13px] font-semibold">{hasTotal ? 'Total' : 'Preco por hora'}</Text>

        <Text className="mt-1 text-[13px] leading-5 text-[#303030]" numberOfLines={1}>
          {court.name}
        </Text>
      </View>

      <Text
        className="max-w-[48%] text-right text-[22px] font-semibold leading-[28px] text-[#101010]"
        numberOfLines={1}>
        {hasTotal ? totalLabel : hourlyLabel}
      </Text>
    </View>
  );
}
