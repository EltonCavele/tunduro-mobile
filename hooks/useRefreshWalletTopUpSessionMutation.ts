import { useMutation, useQueryClient } from '@tanstack/react-query';

import { walletQueryKeys } from 'lib/query-keys';
import { refreshWalletTopUpSession, WalletTopUpSessionStatus } from 'services/wallet.service';

export function useRefreshWalletTopUpSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => refreshWalletTopUpSession(sessionId),
    mutationKey: [...walletQueryKeys.topUp, 'refresh'] as const,
    onSuccess: async (session, sessionId) => {
      queryClient.setQueryData(walletQueryKeys.topUpDetail(sessionId), session);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: walletQueryKeys.topUp,
        }),
        queryClient.invalidateQueries({
          queryKey: ['payments'],
        }),
        session.status === WalletTopUpSessionStatus.COMPLETED
          ? queryClient.invalidateQueries({
              queryKey: walletQueryKeys.me,
            })
          : Promise.resolve(),
      ]);
    },
  });
}
