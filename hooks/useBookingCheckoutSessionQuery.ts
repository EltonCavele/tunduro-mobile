import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { bookingQueryKeys } from 'lib/query-keys';
import { getBookingCheckoutSession } from 'services/booking.service';

interface UseBookingCheckoutSessionQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false | ((query: any) => number | false);
}

export function useBookingCheckoutSessionQuery(
  sessionId?: string | null,
  options?: UseBookingCheckoutSessionQueryOptions
) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedSessionId = sessionId?.trim();

  return useQuery({
    queryKey: normalizedSessionId
      ? bookingQueryKeys.bookingCheckoutDetail(normalizedSessionId)
      : ([...bookingQueryKeys.bookingCheckout, 'idle'] as const),
    queryFn: () => getBookingCheckoutSession(normalizedSessionId!),
    enabled: Boolean(normalizedSessionId) && (options?.enabled ?? true) && isHydrated && hasSession,
    refetchInterval: options?.refetchInterval,
    staleTime: 5_000,
  });
}
