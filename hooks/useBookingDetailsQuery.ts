import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { bookingQueryKeys } from 'lib/query-keys';
import { getBookingDetails } from 'services/booking.service';

interface UseBookingDetailsQueryOptions {
  enabled?: boolean;
}

export function useBookingDetailsQuery(
  bookingId?: string | null,
  options?: UseBookingDetailsQueryOptions
) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedBookingId = bookingId?.trim();

  return useQuery({
    queryKey: normalizedBookingId
      ? bookingQueryKeys.detail(normalizedBookingId)
      : ([...bookingQueryKeys.all, 'detail', 'idle'] as const),
    queryFn: () => getBookingDetails(normalizedBookingId!),
    enabled: Boolean(normalizedBookingId) && (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 60_000,
  });
}
