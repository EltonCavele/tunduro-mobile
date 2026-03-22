import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { courtQueryKeys } from 'lib/query-keys';
import { getCourt } from 'services/court.service';

interface UseCourtQueryOptions {
  enabled?: boolean;
}

export function useCourtQuery(courtId?: string | null, options?: UseCourtQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedCourtId = courtId?.trim();

  return useQuery({
    queryKey: normalizedCourtId
      ? courtQueryKeys.detail(normalizedCourtId)
      : ([...courtQueryKeys.all, 'detail', 'idle'] as const),
    queryFn: () => getCourt(normalizedCourtId!),
    enabled: Boolean(normalizedCourtId) && (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 5 * 60_000,
  });
}
