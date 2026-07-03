import { Text } from 'components/app/Text';
import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useRefreshWalletTopUpSessionMutation } from 'hooks/useRefreshWalletTopUpSessionMutation';
import { useWalletTopUpSessionQuery } from 'hooks/useWalletTopUpSessionQuery';
import { getErrorMessage } from 'lib/error-utils';
import { walletQueryKeys } from 'lib/query-keys';
import { WalletTopUpSessionStatus } from 'services/wallet.service';

export function WalletTopUpReturnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId.trim() : '';
  const refreshMutation = useRefreshWalletTopUpSessionMutation();
  const hasRequestedRefreshRef = useRef(false);

  const topUpQuery = useWalletTopUpSessionQuery(sessionId, {
    enabled: Boolean(sessionId),
  });

  const topUpSession = topUpQuery.data ?? null;
  let title = 'A validar';
  let description = 'Estamos a validar o pagamento.';

  if (topUpSession?.status === WalletTopUpSessionStatus.COMPLETED) {
    title = 'Carteira carregada';
    description = 'Saldo atualizado.';
  } else if (topUpSession?.status === WalletTopUpSessionStatus.PAYMENT_FAILED) {
    title = 'Pagamento falhou';
    description = topUpSession.failureReason || 'O pagamento nao foi concluido.';
  } else if (topUpSession?.status === WalletTopUpSessionStatus.EXPIRED) {
    title = 'Sessao expirada';
    description = 'A sessao de pagamento expirou.';
  }

  useEffect(() => {
    if (!sessionId || hasRequestedRefreshRef.current) {
      return;
    }

    hasRequestedRefreshRef.current = true;
    refreshMutation.mutate(sessionId);
  }, [refreshMutation, sessionId]);

  useEffect(() => {
    if (topUpSession?.status !== WalletTopUpSessionStatus.COMPLETED) {
      return;
    }

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: walletQueryKeys.me }),
      queryClient.invalidateQueries({ queryKey: ['payments'] }),
    ]);
    const timeoutId = setTimeout(() => router.replace('/payments'), 900);

    return () => clearTimeout(timeoutId);
  }, [queryClient, router, topUpSession?.status]);

  if (!sessionId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[22px] font-semibold text-[#171717]">Pagamento invalido</Text>
          <Text className="mt-3 text-center text-[14px] leading-6 text-[#727272]">
            Nao recebemos uma sessao de recarga valida.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-full bg-[#BDE111] px-5 py-3.5"
            onPress={() => router.replace('/payments')}>
            <Text className="text-[14px] font-semibold text-[#171717]">Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isBusy =
    topUpQuery.isLoading ||
    refreshMutation.isPending ||
    topUpSession?.status === WalletTopUpSessionStatus.OPEN;
  const errorMessage =
    topUpQuery.error || refreshMutation.error
      ? getErrorMessage(
          topUpQuery.error ?? refreshMutation.error,
          'Nao foi possivel validar a recarga.'
        )
      : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-6">
        {isBusy ? (
          <View className="items-center">
            <LoadingIndicator size="small" />
          </View>
        ) : null}

        <Text
          className={`text-center text-[22px] font-semibold text-[#171717] ${
            isBusy ? 'mt-4' : ''
          }`}>
          {title}
        </Text>

        <Text className="mt-3 text-center text-[14px] leading-6 text-[#727272]">{description}</Text>

        {errorMessage ? (
          <Text className="mt-4 text-center text-[13px] leading-5 text-[#D05B5B]">
            {errorMessage}
          </Text>
        ) : null}

        {!isBusy && topUpSession?.status !== WalletTopUpSessionStatus.COMPLETED ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center rounded-full bg-[#BDE111] px-5 py-3.5"
            onPress={() => router.replace('/payments')}>
            <Text className="text-[14px] font-semibold text-[#171717]">Voltar</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
