import { BottomSheet } from 'heroui-native';
import {
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Hash,
  Loader,
  XCircle,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Payment, PaymentStatus } from 'lib/payments.types';
import { LoadingIndicator } from 'components/app/LoadingIndicator';

interface PaymentDetailSheetProps {
  paymentId: string | null;
  payment?: Payment;
  isLoading?: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string; Icon: any }
> = {
  COMPLETED: { label: 'Concluído', color: '#10B981', bg: '#F0FDF4', Icon: CheckCircle },
  PENDING:   { label: 'Pendente',  color: '#F59E0B', bg: '#FFFBEB', Icon: Loader       },
  FAILED:    { label: 'Falhou',    color: '#EF4444', bg: '#FFF1F2', Icon: XCircle      },
  REFUNDED:  { label: 'Reembolso', color: '#6366F1', bg: '#EEF2FF', Icon: ArrowDownLeft},
  CANCELLED: { label: 'Cancelado', color: '#71717A', bg: '#F9FAFB', Icon: XCircle      },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#F4F4F5] py-4">
      <Text className="text-[13px] font-medium text-[#71717A]">{label}</Text>
      <Text className="ml-4 max-w-[55%] text-right text-[13px] font-semibold text-[#18181B]">
        {value}
      </Text>
    </View>
  );
}

export function PaymentDetailSheet({
  paymentId,
  payment,
  isLoading,
  onClose,
}: PaymentDetailSheetProps) {
  const isOpen = Boolean(paymentId);

  const statusCfg = payment ? STATUS_CONFIG[payment.status] : null;

  const formattedAmount = payment
    ? new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: payment.currency || 'MZN',
      }).format(payment.amount)
    : null;

  const formattedDate = payment
    ? new Date(payment.createdAt).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const formattedProcessed = payment?.processedAt
    ? new Date(payment.processedAt).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <BottomSheet
      isOpen={isOpen}
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
          <View className="mb-4 flex-row items-center justify-between">
            <BottomSheet.Title className="text-[18px] font-semibold text-[#111111]">
              Detalhes do Pagamento
            </BottomSheet.Title>
            <BottomSheet.Close
              className="bg-[#F4F4F6]"
              iconProps={{ color: '#181818', size: 20 }}
            />
          </View>

          {isLoading && (
            <View className="items-center py-12">
              <LoadingIndicator size="small" />
              <Text className="mt-4 text-[13px] text-[#71717A]">A carregar detalhes...</Text>
            </View>
          )}

          {!isLoading && payment && statusCfg && (
            <View>
              {/* Amount & Status hero */}
              <View className="mb-6 items-center rounded-3xl py-6" style={{ backgroundColor: statusCfg.bg }}>
                <View
                  className="mb-3 h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: statusCfg.color + '20' }}>
                  <CreditCard size={26} color={statusCfg.color} strokeWidth={1.5} />
                </View>
                <Text className="text-[30px] font-extrabold tracking-tight text-[#18181B]">
                  {formattedAmount}
                </Text>
                <View className="mt-2 flex-row items-center rounded-full px-3 py-1" style={{ backgroundColor: statusCfg.color + '15' }}>
                  <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                  <Text className="ml-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: statusCfg.color }}>
                    {statusCfg.label}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View className="rounded-2xl border border-[#F4F4F5]">
                <View className="px-4">
                  <DetailRow label="Referência" value={`#${payment.reference?.slice(-8).toUpperCase()}`} />
                  <DetailRow label="Tipo" value={payment.type} />
                  <DetailRow label="Data" value={formattedDate ?? '—'} />
                  {formattedProcessed && (
                    <DetailRow label="Processado em" value={formattedProcessed} />
                  )}
                  {payment.booking && (
                    <DetailRow
                      label="Reserva"
                      value={`#${payment.booking.id.slice(-6).toUpperCase()}`}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
