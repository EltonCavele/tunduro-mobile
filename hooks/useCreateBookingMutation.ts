import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import { startBookingCheckout } from 'services/booking.service';

export function useStartBookingCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bookingQueryKeys.create,
    mutationFn: startBookingCheckout,
    onSuccess: async () => {
      await Promise.all([
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
