import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { bookingQueryKeys } from 'lib/query-keys';
import type { BookingCheckoutSession } from 'services/booking.service';
import { BookingCheckoutSessionStatus, getBookingCheckoutSession } from 'services/booking.service';

interface UseBookingCheckoutSessionQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false | ((query: any) => number | false);
}

const TERMINAL_CHECKOUT_STATUSES = new Set<BookingCheckoutSessionStatus>([
  BookingCheckoutSessionStatus.COMPLETED,
  BookingCheckoutSessionStatus.PAYMENT_FAILED,
  BookingCheckoutSessionStatus.EXPIRED,
  BookingCheckoutSessionStatus.REFUNDED,
]);

function getCheckoutPollInterval(session: BookingCheckoutSession | undefined) {
  if (!session) {
    return 3000;
  }

  if (TERMINAL_CHECKOUT_STATUSES.has(session.status)) {
    return false;
  }

  const createdAtMs = new Date(session.createdAt).getTime();

  if (Number.isNaN(createdAtMs)) {
    return 3000;
  }

  const elapsedMs = Date.now() - createdAtMs;

  if (elapsedMs < 30000) {
    return 3000;
  }

  if (elapsedMs < 120000) {
    return 5000;
  }

  return 10000;
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
    refetchInterval:
      options?.refetchInterval ?? ((query) => getCheckoutPollInterval(query.state.data)),
    refetchIntervalInBackground: false,
    staleTime: 0,
    gcTime: 60000,
  });
}
