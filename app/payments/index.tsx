import { useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { ListGroup, Separator } from 'heroui-native';
import { ArrowLeft, CreditCard, SlidersHorizontal } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { PaymentDetailSheet } from 'components/payments/PaymentDetailSheet';
import {
  PaymentFilterSheet,
  STATUS_FILTERS,
  type StatusFilter,
} from 'components/payments/PaymentFilterSheet';
import { PaymentItem } from 'components/payments/PaymentItem';
import { usePaymentByIdQuery } from 'hooks/usePaymentByIdQuery';
import { usePayments } from 'hooks/usePayments';

export default function PaymentsIndexRoute() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePayments();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const paymentQuery = usePaymentByIdQuery(selectedPaymentId);

  const payments = data?.items || [];

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

  const activeLabel = STATUS_FILTERS.find((f) => f.value === activeFilter)?.label ?? 'Todos';
  const hasActiveFilter = activeFilter !== 'ALL';

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
          className={`h-10 w-10 items-center justify-center rounded-full ${hasActiveFilter ? 'bg-[#18181B]' : 'bg-[#FAFAFA]'}`}
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
                  className="flex-row items-center rounded-full border border-[#18181B] bg-[#18181B] px-4 py-2">
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
    </SafeAreaView>
  );
}
