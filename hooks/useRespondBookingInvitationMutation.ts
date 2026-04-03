import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BookingItem } from 'lib/calendar-bookings';
import { bookingQueryKeys, courtQueryKeys } from 'lib/query-keys';
import {
  respondToBookingInvitation,
  type RespondToBookingInvitationPayload,
} from 'services/booking.service';

export function useRespondBookingInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bookingQueryKeys.respondInvitation,
    mutationFn: (payload: RespondToBookingInvitationPayload) => respondToBookingInvitation(payload),
    onSuccess: async (booking, payload) => {
      queryClient.setQueryData<BookingItem>(bookingQueryKeys.detail(payload.bookingId), booking);
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
          queryKey: bookingQueryKeys.detail(payload.bookingId),
        }),
        queryClient.invalidateQueries({
          queryKey: courtQueryKeys.bookings,
        }),
      ]);
    },
  });
}
