import { useMutation, useQueryClient } from '@tanstack/react-query';

import { walletQueryKeys } from 'lib/query-keys';
import { topUpMyWallet } from 'services/wallet.service';

export function useWalletTopUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topUpMyWallet,
    onSuccess: (session) => {
      queryClient.setQueryData(walletQueryKeys.topUpDetail(session.id), session);
      queryClient.invalidateQueries({
        queryKey: walletQueryKeys.topUp,
      });
      queryClient.invalidateQueries({
        queryKey: ['payments'],
      });
    },
  });
}
