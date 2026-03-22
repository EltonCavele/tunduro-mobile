import { useQuery } from '@tanstack/react-query';

import { bookingQueryKeys } from 'lib/query-keys';
import { getAllMyBookings } from 'services/booking.service';

import { useAuthSession } from './useAuthSession';

interface UseMyBookingsQueryOptions {
  enabled?: boolean;
}

export function useMyBookingsQuery(options?: UseMyBookingsQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();

  return useQuery({
    queryKey: bookingQueryKeys.myReservations,
    queryFn: getAllMyBookings,
    enabled: (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 60_000,
  });
}
