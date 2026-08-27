import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { getClubRange } from 'lib/booking-reservation';
import { courtQueryKeys } from 'lib/query-keys';
import { getCourtClosuresBetween } from 'services/court.service';

interface UseCourtWeekClosuresQueryOptions {
  courtId?: string | null;
  weekStartKey: string;
  enabled?: boolean;
}

export function useCourtWeekClosuresQuery(options: UseCourtWeekClosuresQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const courtId = options.courtId?.trim();

  return useQuery({
    queryKey: courtId
      ? courtQueryKeys.weekClosures(courtId, options.weekStartKey)
      : ([...courtQueryKeys.closures, 'week', 'idle'] as const),
    queryFn: () => {
      const { endAt, startAt } = getClubRange(options.weekStartKey, 7);

      return getCourtClosuresBetween(courtId!, startAt, endAt);
    },
    enabled: Boolean(courtId) && (options.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
