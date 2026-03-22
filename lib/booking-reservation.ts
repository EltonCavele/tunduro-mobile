import { BookingStatus, type BookingItem } from 'lib/calendar-bookings';
import type { CourtBooking } from 'lib/court.types';

export const CLUB_TIMEZONE = 'Africa/Maputo';
export const CLUB_TIMEZONE_OFFSET = '+02:00';
export const SLOT_START_HOUR = 6;
export const SLOT_END_HOUR = 22;
export const SLOT_DURATION_MINUTES = 60;
export const MAX_DAILY_BOOKING_MINUTES = 120;
export const MIN_BOOKING_LEAD_MINUTES = 30;
export const MAX_BOOKING_FUTURE_DAYS = 60;

const BLOCKING_BOOKING_STATUSES = new Set<string>([BookingStatus.PENDING, BookingStatus.CONFIRMED]);

export interface BookingHourSlot {
  endAt: string;
  endHour: number;
  key: string;
  label: string;
  startAt: string;
  startHour: number;
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function getDatePartsInClubTimezone(value: Date | string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date(value));

  return {
    year: parts.find((part) => part.type === 'year')?.value ?? '1970',
    month: parts.find((part) => part.type === 'month')?.value ?? '01',
    day: parts.find((part) => part.type === 'day')?.value ?? '01',
  };
}

export function getClubDateKey(value: Date | string) {
  const { day, month, year } = getDatePartsInClubTimezone(value);

  return `${year}-${month}-${day}`;
}

export function getTodayClubDateKey() {
  return getClubDateKey(new Date());
}

export function isValidDateKey(value?: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function buildClubIso(dateKey: string, hour: number, minute = 0) {
  return new Date(
    `${dateKey}T${padNumber(hour)}:${padNumber(minute)}:00${CLUB_TIMEZONE_OFFSET}`
  ).toISOString();
}

export function getClubDayRange(dateKey: string) {
  const startAt = new Date(`${dateKey}T00:00:00${CLUB_TIMEZONE_OFFSET}`);
  const endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);

  return {
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  };
}

export function getMaxBookableDateKey() {
  const today = new Date(`${getTodayClubDateKey()}T00:00:00${CLUB_TIMEZONE_OFFSET}`);
  const maxDate = new Date(today.getTime() + MAX_BOOKING_FUTURE_DAYS * 24 * 60 * 60 * 1000);

  return getClubDateKey(maxDate);
}

export function clampBookableDateKey(value?: string | null): string {
  const today = getTodayClubDateKey();
  const maxDate = getMaxBookableDateKey();
  const normalizedValue = typeof value === 'string' ? value : '';

  if (!isValidDateKey(normalizedValue)) {
    return today;
  }

  if (normalizedValue < today) {
    return today;
  }

  if (normalizedValue > maxDate) {
    return maxDate;
  }

  return normalizedValue;
}

export function formatReservationDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: CLUB_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(buildClubIso(dateKey, 12)));
}

export function formatTimeLabel(iso: string) {
  const parts = new Intl.DateTimeFormat('pt-PT', {
    timeZone: CLUB_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
  const [hours, minutes] = parts.split(':');

  return `${hours}h${minutes}m`;
}

export function formatTimeRangeLabel(startAt: string, endAt: string) {
  return `${formatTimeLabel(startAt)} a ${formatTimeLabel(endAt)}`;
}

export function buildHourlySlots(dateKey: string) {
  const slots: BookingHourSlot[] = [];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    const startAt = buildClubIso(dateKey, hour);
    const endAt = buildClubIso(dateKey, hour + 1);

    slots.push({
      endAt,
      endHour: hour + 1,
      key: `${dateKey}-${padNumber(hour)}`,
      label: formatTimeRangeLabel(startAt, endAt),
      startAt,
      startHour: hour,
    });
  }

  return slots;
}

export function isBlockingBookingStatus(status: string) {
  return BLOCKING_BOOKING_STATUSES.has(status);
}

export function hasTimeOverlap(
  startAt: string,
  endAt: string,
  otherStartAt: string,
  otherEndAt: string
) {
  return (
    new Date(startAt).getTime() < new Date(otherEndAt).getTime() &&
    new Date(endAt).getTime() > new Date(otherStartAt).getTime()
  );
}

export function isSlotBlockedByCourt(bookings: CourtBooking[], slot: BookingHourSlot) {
  return bookings.some(
    (booking) =>
      isBlockingBookingStatus(booking.status) &&
      hasTimeOverlap(slot.startAt, slot.endAt, booking.startAt, booking.endAt)
  );
}

export function isSlotBlockedByOrganizer(
  bookings: BookingItem[],
  organizerId: string,
  slot: BookingHourSlot
) {
  return bookings.some(
    (booking) =>
      booking.organizerId === organizerId &&
      isBlockingBookingStatus(booking.status) &&
      hasTimeOverlap(slot.startAt, slot.endAt, booking.startAt, booking.endAt)
  );
}

export function isSlotBlockedByLeadTime(slot: BookingHourSlot) {
  return new Date(slot.startAt).getTime() < Date.now() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000;
}

export function calculateOrganizerBookedMinutesForDay(
  bookings: BookingItem[],
  organizerId: string,
  dateKey: string
) {
  return bookings.reduce((total, booking) => {
    if (booking.organizerId !== organizerId || !isBlockingBookingStatus(booking.status)) {
      return total;
    }

    if (getClubDateKey(booking.startAt) !== dateKey) {
      return total;
    }

    return total + booking.durationMinutes;
  }, 0);
}

export function getRemainingDailyMinutes(
  bookings: BookingItem[],
  organizerId: string,
  dateKey: string
) {
  return Math.max(
    0,
    MAX_DAILY_BOOKING_MINUTES -
      calculateOrganizerBookedMinutesForDay(bookings, organizerId, dateKey)
  );
}

export function areSlotsAdjacent(firstSlot: BookingHourSlot, secondSlot: BookingHourSlot) {
  return firstSlot.endAt === secondSlot.startAt || secondSlot.endAt === firstSlot.startAt;
}

export function buildSelectedSlotWindow(selectedSlots: BookingHourSlot[]) {
  if (selectedSlots.length === 0) {
    return null;
  }

  const sortedSlots = [...selectedSlots].sort((left, right) =>
    left.startAt.localeCompare(right.startAt)
  );

  return {
    endAt: sortedSlots[sortedSlots.length - 1].endAt,
    startAt: sortedSlots[0].startAt,
  };
}
