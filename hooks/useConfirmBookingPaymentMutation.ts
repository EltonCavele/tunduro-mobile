import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BookingItem } from 'lib/calendar-bookings';
import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import { confirmBookingPayment } from 'services/booking.service';

export function useConfirmBookingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bookingQueryKeys.confirmPayment,
    mutationFn: (bookingId: string) => confirmBookingPayment(bookingId),
    onSuccess: async (booking, bookingId) => {
      queryClient.setQueryData<BookingItem>(bookingQueryKeys.detail(bookingId), booking);
      queryClient.setQueryData<BookingItem[]>(
        bookingQueryKeys.myReservations,
        (currentBookings) =>
          currentBookings?.map((item) => (item.id === booking.id ? booking : item)) ??
          currentBookings
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.myReservations,
        }),
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.detail(bookingId),
        }),
        queryClient.invalidateQueries({
          queryKey: courtQueryKeys.bookings,
        }),
      ]);
    },
  });
}
