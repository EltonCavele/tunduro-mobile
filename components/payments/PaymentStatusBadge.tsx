import { Text, View } from 'react-native';

import type { PaymentStatus } from 'lib/payments.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  COMPLETED: { label: 'Concluído', color: '#10B981' },
  PENDING:   { label: 'Pendente',  color: '#F59E0B' },
  FAILED:    { label: 'Falhou',    color: '#EF4444' },
  REFUNDED:  { label: 'Reembolso', color: '#6366F1' },
  CANCELLED: { label: 'Cancelado', color: '#71717A' },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <View className="flex-row items-center rounded-full border border-[#F4F4F5] bg-white px-2 py-1">
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      <Text className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#52525B]">
        {config.label}
      </Text>
    </View>
  );
}
