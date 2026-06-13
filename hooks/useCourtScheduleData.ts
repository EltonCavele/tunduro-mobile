import { useCallback, useMemo } from 'react';

import { useBookingUsersQuery } from 'hooks/useBookingUsersQuery';
import { useCourtWeekBookingsQuery } from 'hooks/useCourtWeekBookingsQuery';
import { getClubDateKey, isBlockingBookingStatus } from 'lib/booking-reservation';
import { formatReserverName, type CourtScheduleNameResolver } from 'lib/court-schedule';
import type { CourtBooking } from 'lib/court.types';

interface UseCourtScheduleDataOptions {
  courtId?: string | null;
  weekKeys: string[];
  enabled?: boolean;
}

/**
 * Loads a court's bookings for a whole week and resolves each reserver's name.
 *
 * Names appear when the bookings endpoint exposes an embedded `organizer`, or an
 * `organizerId` we can resolve against the user directory. Until then `resolveName`
 * returns null and the UI falls back to a generic "Reservado" label.
 */
export function useCourtScheduleData({ courtId, weekKeys, enabled }: UseCourtScheduleDataOptions) {
  const weekStartKey = weekKeys[0] ?? '';
  const bookingsQuery = useCourtWeekBookingsQuery({
    courtId,
    weekStartKey,
    enabled: Boolean(weekStartKey) && (enabled ?? true),
  });
  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);

  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, CourtBooking[]>();

    bookings.forEach((booking) => {
      const dateKey = getClubDateKey(booking.startAt);
      const existing = grouped.get(dateKey);

      if (existing) {
        existing.push(booking);
      } else {
        grouped.set(dateKey, [booking]);
      }
    });

    return grouped;
  }, [bookings]);

  const datesWithReservations = useMemo(() => {
    const dates = new Set<string>();

    bookings.forEach((booking) => {
      if (isBlockingBookingStatus(booking.status)) {
        dates.add(getClubDateKey(booking.startAt));
      }
    });

    return dates;
  }, [bookings]);

  const organizerIds = useMemo(
    () =>
      Array.from(
        new Set(
          bookings
            .map((booking) => booking.organizer?.id ?? booking.organizerId ?? '')
            .map((value) => value.trim())
            .filter(Boolean)
        )
      ),
    [bookings]
  );

  const usersQuery = useBookingUsersQuery(organizerIds, { enabled: organizerIds.length > 0 });

  const usersById = useMemo(() => {
    const map = new Map<string, string>();

    (usersQuery.data ?? []).forEach((user) => {
      map.set(user.id, formatReserverName(user));
    });

    return map;
  }, [usersQuery.data]);

  const resolveName = useCallback<CourtScheduleNameResolver>(
    (booking: CourtBooking) => {
      if (booking.organizer) {
        return formatReserverName(booking.organizer) || null;
      }

      const organizerId = booking.organizerId?.trim();

      if (organizerId) {
        return usersById.get(organizerId) ?? null;
      }

      return null;
    },
    [usersById]
  );

  const getBookingsForDate = useCallback(
    (dateKey: string) => bookingsByDate.get(dateKey) ?? [],
    [bookingsByDate]
  );

  return {
    getBookingsForDate,
    datesWithReservations,
    resolveName,
    isPending: bookingsQuery.isPending,
    isError: bookingsQuery.isError,
    error: bookingsQuery.error,
    isRefetching: bookingsQuery.isRefetching,
    refetch: bookingsQuery.refetch,
  };
}
