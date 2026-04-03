import { BottomSheet } from 'heroui-native';
import { Text, TouchableOpacity, View } from 'react-native';

import type { PaymentStatus } from 'lib/payments.types';

export type StatusFilter = PaymentStatus | 'ALL';

export const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Todos',      value: 'ALL'       },
  { label: 'Pendente',   value: 'PENDING'   },
  { label: 'Concluído',  value: 'COMPLETED' },
  { label: 'Falhado',    value: 'FAILED'    },
  { label: 'Reembolso',  value: 'REFUNDED'  },
  { label: 'Cancelado',  value: 'CANCELLED' },
];

interface PaymentFilterSheetProps {
  visible: boolean;
  activeFilter: StatusFilter;
  onSelect: (filter: StatusFilter) => void;
  onClose: () => void;
}

export function PaymentFilterSheet({
  visible,
  activeFilter,
  onSelect,
  onClose,
}: PaymentFilterSheetProps) {
  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay style={{ backgroundColor: 'rgba(17, 17, 17, 0.3)' }} />
        <BottomSheet.Content
          backgroundClassName="rounded-t-[32px] bg-white"
          contentContainerClassName="px-6 pb-10 pt-2"
          enableDynamicSizing
          handleIndicatorClassName="bg-[#D9D9DD]">
          <View className="mb-6 flex-row items-center justify-between">
            <BottomSheet.Title className="text-[18px] font-semibold text-[#111111]">
              Filtrar por Status
            </BottomSheet.Title>
            <BottomSheet.Close
              className="bg-[#F4F4F6]"
              iconProps={{ color: '#181818', size: 20 }}
            />
          </View>

          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                activeOpacity={0.7}
                onPress={() => onSelect(filter.value)}
                className={`mb-2 flex-row items-center justify-between rounded-2xl px-4 py-4 ${
                  isActive ? 'bg-[#18181B]' : 'bg-[#FAFAFA]'
                }`}>
                <Text
                  className={`text-[15px] font-semibold ${
                    isActive ? 'text-white' : 'text-[#27272A]'
                  }`}>
                  {filter.label}
                </Text>
                {isActive && (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-white">
                    <View className="h-2.5 w-2.5 rounded-full bg-[#18181B]" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
