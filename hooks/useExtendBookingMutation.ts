import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  clearActiveCheckoutSessionId,
  setActiveCheckoutSessionId,
} from 'lib/active-checkout-storage';
import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import {
  BookingCheckoutSessionStatus,
  startBookingExtensionCheckout,
  type BookingCheckoutSession,
} from 'services/booking.service';

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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.detail(variables.bookingId),
        }),
        queryClient.invalidateQueries({
          queryKey: courtQueryKeys.bookings,
        }),
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.myReservations,
        }),
      ]);

      if (session.status === BookingCheckoutSessionStatus.COMPLETED && session.bookingId) {
        await clearActiveCheckoutSessionId();
        router.push({
          pathname: '/booking/[id]/success',
          params: { id: session.bookingId },
        });
        return;
      }

      await setActiveCheckoutSessionId(session.id);

      router.push({
        pathname: '/checkout/[sessionId]',
        params: { sessionId: session.id },
      });
    },
  });
}
