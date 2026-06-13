import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { getClubRange } from 'lib/booking-reservation';
import { courtQueryKeys } from 'lib/query-keys';
import { getCourtBookingsBetween } from 'services/court.service';

interface UseCourtWeekBookingsQueryOptions {
  courtId?: string | null;
  weekStartKey: string;
  enabled?: boolean;
}

export function useCourtWeekBookingsQuery(options: UseCourtWeekBookingsQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const courtId = options.courtId?.trim();

  return useQuery({
    queryKey: courtId
      ? courtQueryKeys.weekBookings(courtId, options.weekStartKey)
      : ([...courtQueryKeys.bookings, 'week', 'idle'] as const),
    queryFn: () => {
      const { endAt, startAt } = getClubRange(options.weekStartKey, 7);

      return getCourtBookingsBetween(courtId!, startAt, endAt);
    },
    enabled: Boolean(courtId) && (options.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
  });
}
