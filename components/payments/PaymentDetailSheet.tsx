import { Text } from 'components/app/Text';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { ArrowDownLeft, CheckCircle, CreditCard, Loader, X, XCircle } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import type { Payment, PaymentStatus } from 'lib/payments.types';

interface PaymentDetailSheetProps {
  paymentId: string | null;
  payment?: Payment;
  isLoading?: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Concluído', color: '#10B981', bg: '#F0FDF4' },
  PENDING: { label: 'Pendente', color: '#F59E0B', bg: '#FFFBEB' },
  PROCESSING: { label: 'A processar', color: '#3B82F6', bg: '#EFF6FF' },
  FAILED: { label: 'Falhou', color: '#EF4444', bg: '#FFF1F2' },
  REFUNDED: { label: 'Reembolso', color: '#6366F1', bg: '#EEF2FF' },
  CANCELLED: { label: 'Cancelado', color: '#71717A', bg: '#F9FAFB' },
};

const STATUS_ICONS: Record<PaymentStatus, typeof CheckCircle> = {
  COMPLETED: CheckCircle,
  PENDING: Loader,
  PROCESSING: Loader,
  FAILED: XCircle,
  REFUNDED: ArrowDownLeft,
  CANCELLED: XCircle,
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isOpen = Boolean(paymentId);
  const statusCfg = payment ? STATUS_CONFIG[payment.status] : null;
  const StatusIcon = payment ? STATUS_ICONS[payment.status] : CreditCard;
  const snapPoints = useMemo(() => ['90%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} />
    ),
    []
  );

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [isOpen]);

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
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: '#D9D9DD', width: 44 }}
      onDismiss={onClose}
      snapPoints={snapPoints}>
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[18px] font-semibold text-[#111111]">Detalhes do Pagamento</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
            onPress={() => bottomSheetRef.current?.dismiss()}>
            <X color="#181818" size={20} strokeWidth={2.2} />
          </Pressable>
        </View>

        {isLoading && (
          <View className="items-center py-12">
            <LoadingIndicator size="small" />
            <Text className="mt-4 text-[13px] text-[#71717A]">A carregar detalhes...</Text>
          </View>
        )}

        {!isLoading && payment && statusCfg && (
          <View>
            <View
              className="mb-6 items-center rounded-3xl py-6"
              style={{ backgroundColor: statusCfg.bg }}>
              <View
                className="mb-3 h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: statusCfg.color + '20' }}>
                <StatusIcon size={26} color={statusCfg.color} strokeWidth={1.5} />
              </View>
              <Text className="text-[30px] font-extrabold text-[#18181B]">{formattedAmount}</Text>
              <View
                className="mt-2 flex-row items-center rounded-full px-3 py-1"
                style={{ backgroundColor: statusCfg.color + '15' }}>
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusCfg.color }}
                />
                <Text
                  className="ml-2 text-[12px] font-bold uppercase"
                  style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            <View className="rounded-2xl border border-[#F4F4F5]">
              <View className="px-4">
                <DetailRow
                  label="Referência"
                  value={`#${payment.reference?.slice(-8).toUpperCase()}`}
                />
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
