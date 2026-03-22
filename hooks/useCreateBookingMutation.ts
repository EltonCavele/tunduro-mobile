import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import { createBooking } from 'services/booking.service';

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bookingQueryKeys.create,
    mutationFn: createBooking,
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
