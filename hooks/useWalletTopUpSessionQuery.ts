import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { walletQueryKeys } from 'lib/query-keys';
import {
  getWalletTopUpSession,
  WalletTopUpSessionStatus,
} from 'services/wallet.service';

interface UseWalletTopUpSessionQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false | ((query: any) => number | false);
}

const TERMINAL_TOP_UP_STATUSES = new Set<WalletTopUpSessionStatus>([
  WalletTopUpSessionStatus.COMPLETED,
  WalletTopUpSessionStatus.PAYMENT_FAILED,
  WalletTopUpSessionStatus.EXPIRED,
]);

export function useWalletTopUpSessionQuery(
  sessionId?: string | null,
  options?: UseWalletTopUpSessionQueryOptions
) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedSessionId = sessionId?.trim();

  return useQuery({
    queryKey: normalizedSessionId
      ? walletQueryKeys.topUpDetail(normalizedSessionId)
      : ([...walletQueryKeys.topUp, 'idle'] as const),
    queryFn: () => getWalletTopUpSession(normalizedSessionId!),
    enabled: Boolean(normalizedSessionId) && (options?.enabled ?? true) && isHydrated && hasSession,
    refetchInterval:
      options?.refetchInterval ??
      ((query) => {
        const session = query.state.data;
        if (!session) {
          return 3000;
        }

        return TERMINAL_TOP_UP_STATUSES.has(session.status) ? false : 3000;
      }),
    refetchIntervalInBackground: false,
    staleTime: 0,
    gcTime: 60000,
  });
}
