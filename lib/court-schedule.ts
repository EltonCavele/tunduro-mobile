import type { UserProfile } from 'lib/auth.types';
import { buildWeekDateKeys, getBookingStatusLabel, shiftDateKey } from 'lib/calendar-bookings';
import {
  CLUB_TIMEZONE,
  MIN_BOOKING_LEAD_MINUTES,
  SLOT_END_HOUR,
  SLOT_START_HOUR,
  buildClubIso,
  getTodayClubDateKey,
  hasTimeOverlap,
  isBlockingBookingStatus,
} from 'lib/booking-reservation';
import type { CourtBooking, CourtBookingOrganizer } from 'lib/court.types';

export type CourtScheduleSlotState = 'reserved' | 'available' | 'closed';

export interface CourtScheduleReservation {
  id: string;
  status: string;
  statusLabel: string;
  accentColor: string;
  startLabel: string;
  endLabel: string;
  timeRangeLabel: string;
  /** Resolved reserver name, or null when the backend does not expose it yet. */
  personName: string | null;
  displayTitle: string;
  initial: string;
  guestCount: number;
}

export interface CourtScheduleRow {
  hour: number;
  hourLabel: string;
  startAt: string;
  state: CourtScheduleSlotState;
  isCurrentHour: boolean;
  reservation: CourtScheduleReservation | null;
  /** First visible hour occupied by the reservation — render the full card here. */
  isReservationStart: boolean;
}

/** Resolves a CourtBooking to a display name, or null when unknown. */
export type CourtScheduleNameResolver = (booking: CourtBooking) => string | null;

const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  PENDING: '#F08A24',
  CONFIRMED: '#2E9E6B',
  COMPLETED: '#3E8E63',
  CANCELLED: '#E0533D',
  NO_SHOW: '#9AA0A6',
};

const AVATAR_PALETTE = [
  '#7AC74F',
  '#5E88FC',
  '#2A9D8F',
  '#9B5DE5',
  '#E07A5F',
  '#3D8BFD',
  '#D45C7A',
  '#E0A100',
];

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

export function formatScheduleHourLabel(hour: number) {
  return `${padNumber(hour)}:00`;
}

function getClubTimeLabel(iso: string) {
  const parts = new Intl.DateTimeFormat('pt-PT', {
    timeZone: CLUB_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));

  return parts.replace('h', ':');
}

function getScheduleAccentColor(status: string) {
  return SCHEDULE_STATUS_COLORS[status] ?? '#E0533D';
}

export function getScheduleAvatarColor(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1000003;
  }

  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/** Builds the "SURNAME Firstname" label shown on reservation cards (matches mockup). */
export function formatReserverName(person: CourtBookingOrganizer | UserProfile) {
  const firstName = person.firstName?.trim() ?? '';
  const lastName = person.lastName?.trim() ?? '';

  if (lastName && firstName) {
    return `${lastName.toUpperCase()} ${firstName}`;
  }

  if (lastName) {
    return lastName.toUpperCase();
  }

  if (firstName) {
    return firstName;
  }

  const email = person.email?.trim();

  if (email) {
    return email.split('@')[0];
  }

  return '';
}

function getReservationInitial(name: string | null) {
  const trimmed = name?.trim();

  if (!trimmed) {
    return 'R';
  }

  return trimmed.charAt(0).toUpperCase();
}

function getGuestCount(booking: CourtBooking) {
  if (typeof booking.guestCount === 'number') {
    return Math.max(booking.guestCount, 0);
  }

  if (typeof booking.participantCount === 'number') {
    return Math.max(booking.participantCount - 1, 0);
  }

  return 0;
}

function buildReservationMeta(
  booking: CourtBooking,
  resolveName: CourtScheduleNameResolver
): CourtScheduleReservation {
  const embeddedName = booking.organizer ? formatReserverName(booking.organizer) : '';
  const personName = embeddedName || resolveName(booking) || null;
  const startLabel = getClubTimeLabel(booking.startAt);
  const endLabel = getClubTimeLabel(booking.endAt);

  return {
    id: booking.id,
    status: booking.status,
    statusLabel: getBookingStatusLabel(booking.status),
    accentColor: getScheduleAccentColor(booking.status),
    startLabel,
    endLabel,
    timeRangeLabel: `${startLabel} - ${endLabel}`,
    personName,
    displayTitle: personName ?? 'Reservado',
    initial: getReservationInitial(personName),
    guestCount: getGuestCount(booking),
  };
}

export function formatGuestCountLabel(guestCount: number) {
  return `${guestCount} convidado${guestCount === 1 ? '' : 's'}`;
}

/**
 * Expands a single day into hourly rows (06:00 → 22:00) tagged with availability,
 * the current hour, and any reservation that covers each slot.
 */
export function buildCourtScheduleRows(
  dateKey: string,
  bookings: CourtBooking[],
  resolveName: CourtScheduleNameResolver,
  now: Date
): CourtScheduleRow[] {
  const todayKey = getTodayClubDateKey();
  const isPastDay = dateKey < todayKey;
  const isToday = dateKey === todayKey;
  const nowMs = now.getTime();
  const earliestBookableMs = nowMs + MIN_BOOKING_LEAD_MINUTES * 60 * 1000;
  const blockingBookings = bookings.filter((booking) => isBlockingBookingStatus(booking.status));
  const renderedBookingIds = new Set<string>();
  const rows: CourtScheduleRow[] = [];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    const slotStartAt = buildClubIso(dateKey, hour);
    const slotEndAt = buildClubIso(dateKey, hour + 1);
    const slotStartMs = new Date(slotStartAt).getTime();
    const slotEndMs = new Date(slotEndAt).getTime();
    const booking = blockingBookings.find((item) =>
      hasTimeOverlap(slotStartAt, slotEndAt, item.startAt, item.endAt)
    );
    const isCurrentHour = isToday && nowMs >= slotStartMs && nowMs < slotEndMs;

    let reservation: CourtScheduleReservation | null = null;
    let isReservationStart = false;

    if (booking) {
      reservation = buildReservationMeta(booking, resolveName);
      isReservationStart = !renderedBookingIds.has(booking.id);
      renderedBookingIds.add(booking.id);
    }

    const isBookable = !isPastDay && slotStartMs >= earliestBookableMs;
    const state: CourtScheduleSlotState = booking
      ? 'reserved'
      : isBookable
        ? 'available'
        : 'closed';

    rows.push({
      hour,
      hourLabel: formatScheduleHourLabel(hour),
      startAt: slotStartAt,
      state,
      isCurrentHour,
      reservation,
      isReservationStart,
    });
  }

  return rows;
}

export function countReservedRows(rows: CourtScheduleRow[]) {
  return rows.filter((row) => row.isReservationStart).length;
}

const WEEKDAY_SHORT_BY_INDEX = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function getClubWeekdayIndex(dateKey: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CLUB_TIMEZONE,
    weekday: 'short',
  });
  const weekdayShort = formatter.format(new Date(buildClubIso(dateKey, 12)));
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return Math.max(order.indexOf(weekdayShort), 0);
}

export function getCourtScheduleWeek(selectedDate: string) {
  return buildWeekDateKeys(selectedDate, 1);
}

export function shiftScheduleWeek(selectedDate: string, weekOffset: number) {
  return shiftDateKey(selectedDate, weekOffset * 7);
}

export interface CourtScheduleDayChip {
  dateKey: string;
  topLabel: string;
  dayNumber: string;
}

export function buildCourtScheduleDayChips(
  weekKeys: string[],
  todayKey: string
): CourtScheduleDayChip[] {
  const tomorrowKey = shiftDateKey(todayKey, 1);

  return weekKeys.map((dateKey) => {
    let topLabel: string;

    if (dateKey === todayKey) {
      topLabel = 'Hoje';
    } else if (dateKey === tomorrowKey) {
      topLabel = 'Amanha';
    } else {
      topLabel = WEEKDAY_SHORT_BY_INDEX[getClubWeekdayIndex(dateKey)];
    }

    return {
      dateKey,
      topLabel,
      dayNumber: dateKey.slice(-2),
    };
  });
}

export function formatScheduleDateKey(dateKey: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: CLUB_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(buildClubIso(dateKey, 12)));
}

export function formatScheduleWeekRangeLabel(weekKeys: string[]) {
  if (weekKeys.length === 0) {
    return '';
  }

  const first = formatScheduleDateKey(weekKeys[0]);
  const last = formatScheduleDateKey(weekKeys[weekKeys.length - 1]);

  return `${first} - ${last}`;
}

export function formatScheduleSelectedDayLabel(dateKey: string) {
  const formatted = new Intl.DateTimeFormat('pt-PT', {
    timeZone: CLUB_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(buildClubIso(dateKey, 12)));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
