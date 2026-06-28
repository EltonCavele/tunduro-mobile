import { Text } from 'components/app/Text';
import { useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { Separator } from 'heroui-native';
import { ArrowLeft, CreditCard, Plus, SlidersHorizontal, Wallet } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { PaymentDetailSheet } from 'components/payments/PaymentDetailSheet';
import {
  PaymentFilterSheet,
  STATUS_FILTERS,
  type StatusFilter,
} from 'components/payments/PaymentFilterSheet';
import { PaymentItem } from 'components/payments/PaymentItem';
import { WalletTopUpSheet } from 'components/payments/WalletTopUpSheet';
import { usePaymentByIdQuery } from 'hooks/usePaymentByIdQuery';
import { usePayments } from 'hooks/usePayments';
import { useProfileQuery } from 'hooks/useProfileQuery';
import { useWalletQuery } from 'hooks/useWalletQuery';
import { useWalletTopUpMutation } from 'hooks/useWalletTopUpMutation';
import { formatCourtPrice } from 'lib/court-utils';
import { getErrorMessage } from 'lib/error-utils';

export default function PaymentsIndexRoute() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePayments();
  const profileQuery = useProfileQuery();
  const walletQuery = useWalletQuery();
  const walletTopUpMutation = useWalletTopUpMutation();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [topUpSheetOpen, setTopUpSheetOpen] = useState(false);
  const [topUpSuccessMessage, setTopUpSuccessMessage] = useState('');

  const paymentQuery = usePaymentByIdQuery(selectedPaymentId);

  const payments = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'ALL') return payments;
    return payments.filter((p) => p.status === activeFilter);
  }, [payments, activeFilter]);

  const totalAmount = useMemo(
    () => filteredPayments.reduce((acc, curr) => acc + curr.amount, 0),
    [filteredPayments]
  );

  if (isLoading) {
    return <AppScreenLoader message="A carregar pagamentos..." />;
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] text-[#D05B5B]">
            Erro ao carregar pagamentos: {error?.message}
          </Text>
          <Pressable className="mt-4 rounded-xl bg-primary px-6 py-3" onPress={() => refetch()}>
            <Text className="text-[14px] font-bold">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const formattedTotal = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
  }).format(totalAmount);
  const wallet = walletQuery.data;
  const formattedWalletBalance = formatCourtPrice(wallet?.balance ?? 0, wallet?.currency ?? 'MZN');

  const activeLabel = STATUS_FILTERS.find((f) => f.value === activeFilter)?.label ?? 'Todos';
  const hasActiveFilter = activeFilter !== 'ALL';
  const topUpErrorMessage = walletTopUpMutation.error
    ? getErrorMessage(walletTopUpMutation.error, 'Nao foi possivel recarregar.')
    : undefined;
  const readableTopUpError =
    topUpErrorMessage === 'payment.error.invalidPhone'
      ? 'Numero M-Pesa invalido.'
      : topUpErrorMessage === 'payment.error.gatewayUnavailable'
        ? 'M-Pesa indisponivel. Tenta novamente.'
        : topUpErrorMessage;

  async function handleTopUp(payload: { amount: number; phone: string }) {
    setTopUpSuccessMessage('');
    try {
      await walletTopUpMutation.mutateAsync(payload);
      setTopUpSheetOpen(false);
      setTopUpSuccessMessage('Carteira recarregada com sucesso.');
    } catch {
      setTopUpSuccessMessage('');
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-[#F4F4F5] px-5 py-3">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full "
          onPress={() => router.back()}>
          <ArrowLeft size={20} color="#18181B" />
        </Pressable>
        <Text className="text-[17px] font-semibold text-[#18181B]">Histórico</Text>
        <Pressable
          className={`h-10 w-10 items-center justify-center rounded-full ${hasActiveFilter ? 'bg-primary' : 'bg-[#FAFAFA]'}`}
          onPress={() => setFilterSheetOpen(true)}>
          <SlidersHorizontal size={18} color={hasActiveFilter ? '#FFFFFF' : '#18181B'} />
        </Pressable>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={() => 'unused'}
        ListHeaderComponent={() => (
          <View className="pb-4 pt-6">
            <View className="px-5 pb-5">
              <View className="rounded-3xl bg-[#F7F7F8] px-5 py-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
                      <Wallet size={22} color="#18181B" strokeWidth={2} />
                    </View>
                    <View className="ml-4">
                      <Text className="text-[14px] text-[#71717A]">Carteira</Text>
                      <Text className="mt-1 text-[24px] font-bold text-[#18181B]">
                        {walletQuery.isLoading ? '...' : formattedWalletBalance}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    className="h-12 flex-row items-center rounded-full bg-primary px-4"
                    onPress={() => {
                      walletTopUpMutation.reset();
                      setTopUpSheetOpen(true);
                    }}>
                    <Plus size={18} color="#111111" strokeWidth={2.4} />
                    {/*<Text className="ml-2 text-[14px] font-semibold text-[#111111]">
                      Recarregar
                    </Text>*/}
                  </Pressable>
                </View>

                {topUpSuccessMessage ? (
                  <Text className="mt-4 text-[13px] text-[#3F6B22]">{topUpSuccessMessage}</Text>
                ) : null}
              </View>
            </View>

            {/* Summary */}
            <View className="items-center px-5 pb-8">
              <Text className="text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
                {activeLabel}
              </Text>
              <Text className="mt-2 text-[34px] font-extrabold tracking-tight text-[#18181B]">
                {formattedTotal}
              </Text>
              <Text className="mt-1 text-[12px] font-medium text-[#A1A1AA]">
                {filteredPayments.length}{' '}
                {filteredPayments.length === 1 ? 'transação' : 'transações'}
              </Text>
            </View>

            {/* Active filter pill */}
            {hasActiveFilter && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Pressable
                  onPress={() => setActiveFilter('ALL')}
                  className="flex-row items-center rounded-full border border-[#18181B] bg-primary px-4 py-2">
                  <Text className="text-[13px] font-semibold text-white">{activeLabel}</Text>
                  <Text className="ml-2 text-[13px] text-white/60">✕</Text>
                </Pressable>
              </ScrollView>
            )}

            {/* Payments list */}
            {filteredPayments.length > 0 ? (
              <View>
                <View className=" overflow-hidden ">
                  {filteredPayments.map((item, index) => (
                    <View key={item.id} className="border-b border-gray-100">
                      <PaymentItem payment={item} onPress={() => setSelectedPaymentId(item.id)} />
                      {index < filteredPayments.length - 1 && (
                        <Separator className="mx-4 bg-[#F4F4F5]" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="items-center px-5 py-12">
                <View className="h-16 w-16 items-center justify-center ">
                  <CreditCard size={30} strokeWidth={1.5} color="#A1A1AA" />
                </View>
                <Text className="mt-5 text-[15px] font-medium text-[#71717A]">
                  Nenhum pagamento encontrado
                </Text>
                {hasActiveFilter && (
                  <Pressable onPress={() => setActiveFilter('ALL')} className="mt-4">
                    <Text className="text-[13px] font-semibold text-[#18181B]">Limpar filtro</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Bottom Sheet */}
      <PaymentFilterSheet
        visible={filterSheetOpen}
        activeFilter={activeFilter}
        onSelect={(filter) => {
          setActiveFilter(filter);
          setFilterSheetOpen(false);
        }}
        onClose={() => setFilterSheetOpen(false)}
      />

      {/* Payment Detail Bottom Sheet */}
      <PaymentDetailSheet
        paymentId={selectedPaymentId}
        payment={paymentQuery.data}
        isLoading={paymentQuery.isLoading}
        onClose={() => setSelectedPaymentId(null)}
      />

      <WalletTopUpSheet
        apiErrorMessage={readableTopUpError}
        initialPhone={profileQuery.data?.phone}
        isLoading={walletTopUpMutation.isPending}
        onClose={() => setTopUpSheetOpen(false)}
        onResetError={() => walletTopUpMutation.reset()}
        onSubmit={(payload) => void handleTopUp(payload)}
        visible={topUpSheetOpen}
      />
    </SafeAreaView>
  );
}
