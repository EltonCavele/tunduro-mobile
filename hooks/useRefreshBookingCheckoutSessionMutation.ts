import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BookingCheckoutSession } from 'services/booking.service';
import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import { refreshBookingCheckoutSession } from 'services/booking.service';

export function useRefreshBookingCheckoutSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => refreshBookingCheckoutSession(sessionId),
    mutationKey: [...bookingQueryKeys.bookingCheckout, 'refresh'] as const,
    onSuccess: async (session, sessionId) => {
      queryClient.setQueryData<BookingCheckoutSession>(
        bookingQueryKeys.bookingCheckoutDetail(sessionId),
        session
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.bookingCheckout,
        }),
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.myReservations,
        }),
        queryClient.invalidateQueries({
          queryKey: courtQueryKeys.bookings,
        }),
      ]);
    },
  });
}
