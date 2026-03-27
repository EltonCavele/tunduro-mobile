import { useEffect, useMemo, useRef } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { useBookingCheckoutSessionQuery } from 'hooks/useBookingCheckoutSessionQuery';
import { useRefreshBookingCheckoutSessionMutation } from 'hooks/useRefreshBookingCheckoutSessionMutation';
import { getErrorMessage } from 'lib/error-utils';
import {
  BookingCheckoutSessionStatus,
  type BookingCheckoutSession,
} from 'services/booking.service';

function getCheckoutStatusContent(session: BookingCheckoutSession | null) {
  switch (session?.status) {
    case BookingCheckoutSessionStatus.COMPLETED:
      return {
        description: 'Pagamento confirmado. Estamos a abrir os detalhes da tua reserva.',
        title: 'Reserva confirmada',
      };
    case BookingCheckoutSessionStatus.PAYMENT_FAILED:
      return {
        description:
          session.failureReason ||
          'O pagamento nao foi concluido. Podes voltar e tentar novamente.',
        title: 'Pagamento falhou',
      };
    case BookingCheckoutSessionStatus.EXPIRED:
      return {
        description: 'A sessao de pagamento expirou antes da confirmacao da reserva.',
        title: 'Sessao expirada',
      };
    case BookingCheckoutSessionStatus.REFUNDED:
      return {
        description:
          'Recebemos o pagamento, mas a reserva nao pode ser confirmada. O reembolso foi iniciado.',
        title: 'Pagamento reembolsado',
      };
    case BookingCheckoutSessionStatus.REFUND_PENDING:
      return {
        description:
          'Recebemos o pagamento, mas a reserva nao pode ser confirmada. O reembolso esta a ser processado.',
        title: 'Reembolso em processamento',
      };
    case BookingCheckoutSessionStatus.FINALIZING:
      return {
        description: 'O pagamento foi recebido. Estamos a finalizar a reserva.',
        title: 'A confirmar reserva',
      };
    case BookingCheckoutSessionStatus.OPEN:
    default:
      return {
        description: 'Estamos a validar o estado mais recente do pagamento.',
        title: 'A validar pagamento',
      };
  }
}

export function BookingPaymentReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string; status?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId.trim() : '';
  const refreshMutation = useRefreshBookingCheckoutSessionMutation();
  const hasRequestedRefreshRef = useRef(false);

  const bookingCheckoutQuery = useBookingCheckoutSessionQuery(sessionId, {
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status &&
        [
          BookingCheckoutSessionStatus.OPEN,
          BookingCheckoutSessionStatus.FINALIZING,
          BookingCheckoutSessionStatus.REFUND_PENDING,
        ].includes(status)
        ? 3_000
        : false;
    },
  });

  const checkoutSession = bookingCheckoutQuery.data ?? null;
  const content = useMemo(() => getCheckoutStatusContent(checkoutSession), [checkoutSession]);

  useEffect(() => {
    if (!sessionId || hasRequestedRefreshRef.current) {
      return;
    }

    hasRequestedRefreshRef.current = true;
    refreshMutation.mutate(sessionId);
  }, [refreshMutation, sessionId]);

  useEffect(() => {
    if (!checkoutSession) {
      return;
    }

    if (
      checkoutSession.status === BookingCheckoutSessionStatus.COMPLETED &&
      checkoutSession.bookingId
    ) {
      router.replace({
        params: {
          id: checkoutSession.bookingId,
        },
        pathname: '/bookings/[id]',
      });
    }
  }, [checkoutSession, router]);

  if (!sessionId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[22px] font-semibold text-[#171717]">Pagamento invalido</Text>
          <Text className="mt-3 text-center text-[14px] leading-6 text-[#727272]">
            Nao recebemos uma sessao de checkout valida para concluir esta operacao.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-full bg-[#1F3125] px-5 py-3.5"
            onPress={() => router.replace('/(tabs)/reserve')}>
            <Text className="text-[14px] font-semibold text-white">Voltar as reservas</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isBusy =
    bookingCheckoutQuery.isLoading ||
    refreshMutation.isPending ||
    checkoutSession?.status === BookingCheckoutSessionStatus.OPEN ||
    checkoutSession?.status === BookingCheckoutSessionStatus.FINALIZING;

  const errorMessage =
    bookingCheckoutQuery.error || refreshMutation.error
      ? getErrorMessage(
          bookingCheckoutQuery.error ?? refreshMutation.error,
          'Nao foi possivel validar o pagamento desta reserva.'
        )
      : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-[30px] bg-[#F6F7F5] px-6 py-8">
          {isBusy ? <ActivityIndicator color="#1F3125" size="small" /> : null}

          <Text
            className={`text-center text-[22px] font-semibold text-[#171717] ${
              isBusy ? 'mt-4' : ''
            }`}>
            {content.title}
          </Text>

          <Text className="mt-3 text-center text-[14px] leading-6 text-[#727272]">
            {content.description}
          </Text>

          {errorMessage ? (
            <Text className="mt-4 text-center text-[13px] leading-5 text-[#D05B5B]">
              {errorMessage}
            </Text>
          ) : null}

          {!isBusy && checkoutSession?.status !== BookingCheckoutSessionStatus.COMPLETED ? (
            <Pressable
              accessibilityRole="button"
              className="mt-6 items-center rounded-full bg-[#1F3125] px-5 py-3.5"
              onPress={() => router.replace('/(tabs)/reserve')}>
              <Text className="text-[14px] font-semibold text-white">Voltar as reservas</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
