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
  totalLabel?: string | null;
}

export function NewBookingPriceHighlight({
  court,
  lightingRequested = false,
  rangeLabel,
  role,
  totalLabel,
}: NewBookingPriceHighlightProps) {
  const hourlyPrice = getBookingHourlyPrice(court, role, lightingRequested);
  const hourlyLabel = formatCourtPrice(hourlyPrice, court.currency);
  const hasTotal = Boolean(totalLabel);

  return (
    <View className="mb-5 overflow-hidden rounded-[22px] bg-[#BDE111] px-5 py-4">
      <Text className="text-[15px] font-semibold">{hasTotal ? 'Total' : 'Preco por hora'}</Text>

      <Text className="mt-1 text-[34px] font-semibold leading-[40px] text-[#101010]">
        {hasTotal ? totalLabel : hourlyLabel}
      </Text>

      <Text className="mt-1 text-[15px] leading-6">
        {hasTotal ? `${rangeLabel} - ${hourlyLabel}/hora` : court.name}
      </Text>
    </View>
  );
}
