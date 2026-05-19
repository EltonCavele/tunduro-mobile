import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: async (_, payload) => {
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
