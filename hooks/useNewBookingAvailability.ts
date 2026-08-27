import { useMemo } from 'react';

import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import { useCourtDayBookingsQuery } from 'hooks/useCourtDayBookingsQuery';
import { useCourtDayClosuresQuery } from 'hooks/useCourtDayClosuresQuery';
import {
  buildHourlySlots,
  hasTimeOverlap,
  isSlotBlockedByCourt,
  isSlotBlockedByLeadTime,
  isSlotBlockedByOrganizer,
  SLOT_DURATION_MINUTES,
} from 'lib/booking-reservation';
import type { BookingItem } from 'lib/calendar-bookings';
import { getErrorMessage } from 'lib/error-utils';

interface UseNewBookingAvailabilityOptions {
  courtId: string;
  dateKey: string;
  myBookings: BookingItem[];
  organizerId?: string;
  remainingDailyMinutes: number;
  selectedSlotKeys: string[];
}

export function useNewBookingAvailability(options: UseNewBookingAvailabilityOptions) {
  const bookingsQuery = useCourtDayBookingsQuery({
    courtId: options.courtId,
    dateKey: options.dateKey,
    enabled: Boolean(options.courtId),
  });
  const closuresQuery = useCourtDayClosuresQuery({
    courtId: options.courtId,
    dateKey: options.dateKey,
    enabled: Boolean(options.courtId),
  });
  const timeSlots = useMemo(() => buildHourlySlots(options.dateKey), [options.dateKey]);
  const selectableSlots = useMemo<SelectableTimeSlot[]>(
    () =>
      timeSlots.map((slot) => {
        const closure = (closuresQuery.data ?? []).find((item) =>
          hasTimeOverlap(slot.startAt, slot.endAt, item.startAt, item.endAt)
        );
        const isCourtBlocked = isSlotBlockedByCourt(bookingsQuery.data ?? [], slot);
        const isOrganizerBlocked = options.organizerId
          ? isSlotBlockedByOrganizer(options.myBookings, options.organizerId, slot)
          : false;
        const isLeadTimeBlocked = isSlotBlockedByLeadTime(slot);
        const isDisabled =
          options.remainingDailyMinutes < SLOT_DURATION_MINUTES ||
          Boolean(closure) ||
          isCourtBlocked ||
          isOrganizerBlocked ||
          isLeadTimeBlocked;

        return {
          ...slot,
          accentColors: ['#EEF3EE', '#EEF3EE'],
          closure: closure ?? null,
          isCourtBlocked,
          isDisabled,
          isLeadTimeBlocked,
          isOrganizerBlocked,
          isSelected: options.selectedSlotKeys.includes(slot.key),
        };
      }),
    [
      bookingsQuery.data,
      closuresQuery.data,
      options.myBookings,
      options.organizerId,
      options.remainingDailyMinutes,
      options.selectedSlotKeys,
      timeSlots,
    ]
  );
  const invalidSelectedSlotKeys = useMemo(
    () =>
      options.selectedSlotKeys.filter(
        (key) => !selectableSlots.some((slot) => slot.key === key && !slot.isDisabled)
      ),
    [options.selectedSlotKeys, selectableSlots]
  );
  const error = bookingsQuery.error ?? closuresQuery.error;

  return {
    error,
    errorMessage:
      error && options.courtId
        ? getErrorMessage(error, 'Nao foi possivel carregar os horarios.')
        : '',
    invalidSelectedSlotKeys,
    isError: bookingsQuery.isError || closuresQuery.isError,
    isLoading: Boolean(options.courtId) && (bookingsQuery.isLoading || closuresQuery.isLoading),
    refetch: () => Promise.all([bookingsQuery.refetch(), closuresQuery.refetch()]),
    selectableSlots,
  };
}
