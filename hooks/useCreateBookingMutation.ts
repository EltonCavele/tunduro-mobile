import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { setActiveCheckoutSessionId } from 'lib/active-checkout-storage';
import { bookingQueryKeys, courtQueryKeys, walletQueryKeys } from 'lib/query-keys';
import type { BookingCheckoutSession } from 'services/booking.service';
import { startBookingCheckout } from 'services/booking.service';

export function useStartBookingCheckoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: bookingQueryKeys.create,
    mutationFn: startBookingCheckout,
    onSuccess: async (session) => {
      queryClient.setQueryData<BookingCheckoutSession>(
        bookingQueryKeys.bookingCheckoutDetail(session.id),
        session
      );
      await setActiveCheckoutSessionId(session.id);

      await queryClient.invalidateQueries({
        queryKey: courtQueryKeys.bookings,
      });
      await queryClient.invalidateQueries({
        queryKey: walletQueryKeys.me,
      });
      await queryClient.invalidateQueries({
        queryKey: ['payments'],
      });

      router.replace({
        pathname: '/checkout/[sessionId]',
        params: { sessionId: session.id },
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
