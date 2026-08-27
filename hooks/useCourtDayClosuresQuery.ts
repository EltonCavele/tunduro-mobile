import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { courtQueryKeys } from 'lib/query-keys';
import { getCourtDayClosures } from 'services/court.service';

interface UseCourtDayClosuresQueryOptions {
  courtId?: string | null;
  dateKey: string;
  enabled?: boolean;
}

export function useCourtDayClosuresQuery(options: UseCourtDayClosuresQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const courtId = options.courtId?.trim();

  return useQuery({
    queryKey: courtId
      ? courtQueryKeys.dayClosures(courtId, options.dateKey)
      : ([...courtQueryKeys.closures, 'idle'] as const),
    queryFn: () => getCourtDayClosures(courtId!, options.dateKey),
    enabled: Boolean(courtId) && (options.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
