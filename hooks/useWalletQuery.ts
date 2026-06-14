import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { walletQueryKeys } from 'lib/query-keys';
import { getMyWallet } from 'services/wallet.service';

export function useWalletQuery() {
  const { hasSession, isHydrated } = useAuthSession();

  return useQuery({
    queryKey: walletQueryKeys.me,
    queryFn: getMyWallet,
    enabled: isHydrated && hasSession,
    staleTime: 30_000,
  });
}
