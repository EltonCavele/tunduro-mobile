import { Text } from 'components/app/Text';
import { useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, KeyRound, Signal } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useBookingCheckoutSessionQuery } from 'hooks/useBookingCheckoutSessionQuery';
import { clearActiveCheckoutSessionId } from 'lib/active-checkout-storage';
import { bookingQueryKeys } from 'lib/query-keys';
import {
  BookingCheckoutSessionStatus,
  type BookingCheckoutSession,
} from 'services/booking.service';

function formatCurrencyValue(amount: number, currency: string) {
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

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiresAt]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <Text className="mt-4 text-center text-[14px] text-[#6C6C6C]">
      Tempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
    </Text>
  );
}

function CheckoutWaitingContent({ session }: { session: BookingCheckoutSession }) {
  return (
    <>
      <Text className="mt-6 text-center text-[24px] font-semibold text-[#171717]">
        Confirme o pagamento
      </Text>
      <Text className="mt-3 text-center text-[14px] leading-6 text-[#666666]">
        Foi enviada uma notificacao para {session.phone || 'o teu numero M-Pesa'}. Insira o PIN para
        concluir a reserva.
      </Text>

      <ExpiryCountdown expiresAt={session.expiresAt} />

      <View className="mt-6 rounded-[22px] bg-[#F4F5F4] px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-[#6F6F6F]">Valor</Text>
          <Text className="text-[14px] font-semibold text-[#171717]">
            {formatCurrencyValue(session.amount, session.currency)}
          </Text>
        </View>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[13px] text-[#6F6F6F]">Referencia</Text>
          <Text className="text-[13px] font-semibold text-[#171717]">{session.reference}</Text>
        </View>
      </View>

      <View className="mt-6 gap-3">
        <View className="flex-row items-center">
          <Bell size={16} stroke="#1F3125" strokeWidth={2} />
          <Text className="ml-2 text-[13px] text-[#5E5E5E]">
            Mantenha o telemovel desbloqueado.
          </Text>
        </View>
        <View className="flex-row items-center">
          <Signal size={16} stroke="#1F3125" strokeWidth={2} />
          <Text className="ml-2 text-[13px] text-[#5E5E5E]">Garanta cobertura de rede.</Text>
        </View>
        <View className="flex-row items-center">
          <KeyRound size={16} stroke="#1F3125" strokeWidth={2} />
          <Text className="ml-2 text-[13px] text-[#5E5E5E]">Aceite o pedido e digite o PIN.</Text>
        </View>
      </View>
    </>
  );
}

export function CheckoutWaitingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId.trim() : '';
  const checkoutQuery = useBookingCheckoutSessionQuery(sessionId, {
    enabled: Boolean(sessionId),
  });
  const session = checkoutQuery.data;

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.status === BookingCheckoutSessionStatus.COMPLETED && session.bookingId) {
      void clearActiveCheckoutSessionId();
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingQueryKeys.myReservations }),
        queryClient.invalidateQueries({ queryKey: bookingQueryKeys.detail(session.bookingId) }),
      ]);
      router.replace({
        pathname: '/booking/[id]/success',
        params: { id: session.bookingId },
      });
      return;
    }

    if (session.status === BookingCheckoutSessionStatus.PAYMENT_FAILED) {
      void clearActiveCheckoutSessionId();
      router.replace({
        pathname: '/checkout/failed',
        params: { reason: session.failureReason ?? '', sessionId: session.id },
      });
      return;
    }

    if (session.status === BookingCheckoutSessionStatus.EXPIRED) {
      void clearActiveCheckoutSessionId();
      router.replace('/checkout/expired');
    }
  }, [queryClient, router, session]);

  const title = useMemo(() => {
    if (!session) {
      return 'A validar pagamento';
    }

    if (session.status === BookingCheckoutSessionStatus.FINALIZING) {
      return 'A finalizar reserva';
    }

    return 'A aguardar M-Pesa';
  }, [session]);

  if (!sessionId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[24px] font-semibold text-[#171717]">Sessao invalida</Text>
          <Text className="mt-3 text-center text-[14px] leading-6 text-[#666666]">
            Nao encontramos uma sessao de checkout valida.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-full bg-[#1F3125] px-5 py-3.5"
            onPress={() => router.replace('/bookings/new')}>
            <Text className="text-[14px] font-semibold text-white">Nova reserva</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 px-6 py-8">
        <View className="items-center">
          <LoadingIndicator size="large" />
          <Text className="mt-4 text-[18px] font-semibold text-[#171717]">{title}</Text>
        </View>

        {checkoutQuery.isError ? (
          <View className="mt-8 rounded-[24px] bg-[#FFF3F3] px-5 py-5">
            <Text className="text-[14px] text-[#A14C4C]">
              Nao foi possivel obter o estado mais recente do pagamento.
            </Text>
          </View>
        ) : session ? (
          <CheckoutWaitingContent session={session} />
        ) : (
          <Text className="mt-8 text-center text-[14px] text-[#666666]">
            A carregar o estado do checkout...
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          className="mt-auto items-center rounded-full border border-[#DADADA] px-5 py-3.5"
          onPress={() => router.back()}>
          <Text className="text-[14px] font-semibold text-[#2A2A2A]">Cancelar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
