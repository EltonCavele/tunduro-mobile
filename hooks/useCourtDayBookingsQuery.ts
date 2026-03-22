import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { courtQueryKeys } from 'lib/query-keys';
import { getCourtDayBookings } from 'services/court.service';

interface UseCourtDayBookingsQueryOptions {
  courtId?: string | null;
  dateKey: string;
  enabled?: boolean;
}

export function useCourtDayBookingsQuery(options: UseCourtDayBookingsQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const courtId = options.courtId?.trim();

  return useQuery({
    queryKey: courtId
      ? courtQueryKeys.dayBookings(courtId, options.dateKey)
      : ([...courtQueryKeys.bookings, 'idle'] as const),
    queryFn: () => getCourtDayBookings(courtId!, options.dateKey),
    enabled: Boolean(courtId) && (options.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
  });
}
