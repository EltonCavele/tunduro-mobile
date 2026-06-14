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
    <View className="mb-6 overflow-hidden rounded-[24px] bg-[#BDE111] px-5 py-5">
      <Text className="text-[12px] font-semibold">
        {hasTotal ? 'Total da reserva' : 'Preco por hora'}
      </Text>

      <Text className="mt-2 text-[36px] font-semibold leading-[42px] text-[#101010]">
        {hasTotal ? totalLabel : hourlyLabel}
      </Text>

      <Text className="mt-2 text-[14px] leading-5">
        {hasTotal
          ? `${rangeLabel} • ${hourlyLabel}/hora`
          : `${court.name} • ${hourlyLabel} por cada hora reservada`}
      </Text>
    </View>
  );
}
