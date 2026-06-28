import { useMutation, useQueryClient } from '@tanstack/react-query';

import { walletQueryKeys } from 'lib/query-keys';
import type { Wallet } from 'lib/wallet.types';
import { topUpMyWallet } from 'services/wallet.service';

export function useWalletTopUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topUpMyWallet,
    onSuccess: (wallet) => {
      queryClient.setQueryData<Wallet>(walletQueryKeys.me, wallet);

      queryClient.invalidateQueries({
        queryKey: walletQueryKeys.me,
      });
    },
  });
}
