import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { setActiveCheckoutSessionId } from 'lib/active-checkout-storage';
import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import type { BookingCheckoutSession } from 'services/booking.service';
import { startBookingExtensionCheckout } from 'services/booking.service';

export function useExtendBookingMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: bookingQueryKeys.extend,
    mutationFn: startBookingExtensionCheckout,
    onSuccess: async (session, variables) => {
      queryClient.setQueryData<BookingCheckoutSession>(
        bookingQueryKeys.bookingCheckoutDetail(session.id),
        session
      );
      await setActiveCheckoutSessionId(session.id);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.detail(variables.bookingId),
        }),
        queryClient.invalidateQueries({
          queryKey: courtQueryKeys.bookings,
        }),
      ]);

      router.push({
        pathname: '/checkout/[sessionId]',
        params: { sessionId: session.id },
      });
    },
  });
}
