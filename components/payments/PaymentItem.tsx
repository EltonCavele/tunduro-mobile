import { ListGroup } from 'heroui-native';
import { CreditCard } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Payment } from 'lib/payments.types';

import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentItemProps {
  payment: Payment;
  onPress?: () => void;
}

export function PaymentItem({ payment, onPress }: PaymentItemProps) {
  const formattedDate = new Date(payment.createdAt).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: payment.currency || 'MZN',
  }).format(payment.amount);

  return (
    <ListGroup.Item onPress={onPress}>
      <ListGroup.ItemPrefix>
        <View className="h-10 w-10 items-center justify-center rounded-[10px] border border-[#F0F0F0] bg-[#FAFAFA]">
          <CreditCard size={18} strokeWidth={1.5} color="#3F3F46" />
        </View>
      </ListGroup.ItemPrefix>
      <ListGroup.ItemContent>
        <View className="flex-row items-center justify-between">
          <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#18181B]">
            {formattedAmount}
          </ListGroup.ItemTitle>
          <PaymentStatusBadge status={payment.status} />
        </View>
        <View className="mt-1 flex-row items-center">
          <Text className="text-[12px] font-medium text-[#71717A]">{formattedDate}</Text>
          <View className="mx-2 h-1 w-1 rounded-full bg-[#D4D4D8]" />
          <Text className="text-[12px] font-medium tracking-wide text-[#A1A1AA]">
            #{payment.reference?.slice(-6).toUpperCase()}
          </Text>
        </View>
      </ListGroup.ItemContent>
      <ListGroup.ItemSuffix />
    </ListGroup.Item>
  );
}
