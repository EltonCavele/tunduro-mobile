import { Text } from 'components/app/Text';
import { View } from 'react-native';

import type { Court } from 'lib/court.types';

function formatCourtPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency || 'MZN',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'MZN'}`;
  }
}

interface NewBookingPriceHighlightProps {
  court: Court;
  rangeLabel?: string;
  totalLabel?: string | null;
}

export function NewBookingPriceHighlight({
  court,
  rangeLabel,
  totalLabel,
}: NewBookingPriceHighlightProps) {
  const hourlyLabel = formatCourtPrice(court.pricePerHour, court.currency);
  const hasTotal = Boolean(totalLabel);

  return (
    <View className="mb-6 overflow-hidden rounded-[24px] bg-[#BDE111] px-5 py-5">
      <Text className="text-[12px] font-semibold uppercase tracking-[1.2px]">
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
