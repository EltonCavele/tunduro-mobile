import type { ApiPaginatedData } from 'lib/api.types';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export interface BookingParticipant {
  isOrganizer: boolean;
  status: string;
  userId: string;
}

export interface BookingInvitation {
  expiresAt: string;
  id: string;
  inviteeEmail: string | null;
  invitedUserId: string | null;
  status: string;
  token: string;
}

export interface BookingStatusHistoryItem {
  createdAt: string;
  fromStatus: BookingStatus;
  reason: string | null;
  toStatus: BookingStatus;
}

export interface BookingPayment {
  amount: number;
  currency: string;
  id: string;
  processedAt: string | null;
  reference: string;
  status: string;
  type: string;
}

export interface BookingItem {
  checkedInAt: string | null;
  courtId: string;
  createdAt: string;
  currency: string;
  durationMinutes: number;
  endAt: string;
  id: string;
  invitations: BookingInvitation[];
  organizerId: string;
  paidAmount: number;
  participants: BookingParticipant[];
  paymentDueAt: string | null;
  payments: BookingPayment[];
  seriesId: string | null;
  startAt: string;
  status: BookingStatus;
  statusHistory: BookingStatusHistoryItem[];
  totalPrice: number;
  updatedAt: string;
}

export type BookingListData = ApiPaginatedData<BookingItem>;

export interface CalendarReservation {
  accentColor: string;
  courtLabel: string;
  dateKey: string;
  endLabel: string;
  id: string;
  participantCount: number;
  startAt: string;
  startLabel: string;
  status: BookingStatus;
  timeRangeLabel: string;
  title: string;
}

type MarkedDay = {
  dotColor?: string;
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.CANCELLED]: '#E45B5B',
  [BookingStatus.COMPLETED]: '#45C78B',
  [BookingStatus.CONFIRMED]: '#7C9EE6',
  [BookingStatus.NO_SHOW]: '#8C8C8C',
  [BookingStatus.PENDING]: '#FF7426',
};

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const WEEKDAY_SHORT_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatTimeLabel(date: Date) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

export function deriveCourtLabel(courtId: string) {
  const normalizedCourtId = courtId.replace(/[^a-zA-Z0-9]/g, '');
  const suffix = normalizedCourtId.slice(-2).toUpperCase();

  if (!suffix) {
    return 'Quadra reservada';
  }

  return `Quadra ${suffix}`;
}

export function getReservationColor(status: BookingStatus) {
  return STATUS_COLORS[status];
}

export function getBookingStatusLabel(status: string) {
  switch (status) {
    case BookingStatus.PENDING:
      return 'Pendente';
    case BookingStatus.CONFIRMED:
      return 'Confirmado';
    case BookingStatus.CANCELLED:
      return 'Cancelado';
    case BookingStatus.NO_SHOW:
      return 'Nao compareceu';
    case BookingStatus.COMPLETED:
      return 'Concluido';
    default:
      return status;
  }
}

export function getTodayDateKey() {
  return formatDateKey(new Date());
}

export function isPastDateKey(dateKey: string) {
  return dateKey < getTodayDateKey();
}

export function shiftDateKey(dateKey: string, dayOffset: number) {
  const date = parseDateKey(dateKey);

  date.setDate(date.getDate() + dayOffset);

  return formatDateKey(date);
}

export function formatScheduleHeading(dateKey: string) {
  const date = parseDateKey(dateKey);

  return `${WEEKDAY_NAMES[date.getDay()]} ${date.getDate()}`;
}

export function formatCalendarWeekdayShort(dateKey: string) {
  return WEEKDAY_SHORT_NAMES[parseDateKey(dateKey).getDay()];
}

export function formatCalendarSelectedDateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);

  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date);
}

export function buildWeekDateKeys(selectedDate: string, firstDay = 1) {
  const startOfWeek = parseDateKey(selectedDate);
  let selectedDayOfWeek = startOfWeek.getDay();

  if (selectedDayOfWeek < firstDay) {
    selectedDayOfWeek += 7;
  }

  startOfWeek.setDate(startOfWeek.getDate() - (selectedDayOfWeek - firstDay));

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(startOfWeek);
    nextDate.setDate(startOfWeek.getDate() + index);
    return formatDateKey(nextDate);
  });
}

export function adaptBookingsToCalendarReservations(bookings: BookingItem[]) {
  return bookings
    .map((item) => {
      const startDate = new Date(item.startAt);
      const endDate = new Date(item.endAt);

      return {
        accentColor: getReservationColor(item.status),
        courtLabel: deriveCourtLabel(item.courtId),
        dateKey: formatDateKey(startDate),
        endLabel: formatTimeLabel(endDate),
        id: item.id,
        participantCount: item.participants.length,
        startAt: item.startAt,
        startLabel: formatTimeLabel(startDate),
        status: item.status,
        timeRangeLabel: `${formatTimeLabel(startDate)} - ${formatTimeLabel(endDate)}`,
        title: 'Jogo reservado',
      };
    })
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
}

export function adaptBookingsResponse(response: BookingListData) {
  return adaptBookingsToCalendarReservations(response.items);
}

export function groupReservationsByDate(reservations: CalendarReservation[]) {
  const grouped: Record<string, CalendarReservation[]> = {};

  reservations.forEach((reservation) => {
    if (!grouped[reservation.dateKey]) {
      grouped[reservation.dateKey] = [];
    }

    grouped[reservation.dateKey].push(reservation);
  });

  Object.values(grouped).forEach((items) => {
    items.sort((left, right) => left.startAt.localeCompare(right.startAt));
  });

  return grouped;
}

export function buildMarkedDates(
  groupedReservations: Record<string, CalendarReservation[]>,
  selectedDate: string
) {
  const markedDates: Record<string, MarkedDay> = {};

  Object.entries(groupedReservations).forEach(([dateKey, reservations]) => {
    const accentColor =
      reservations.find((reservation) => reservation.status === BookingStatus.CONFIRMED)
        ?.accentColor ||
      reservations[0]?.accentColor ||
      '#1F3125';

    markedDates[dateKey] = {
      dotColor: accentColor,
      marked: true,
    };
  });

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#BDE111',
    selectedTextColor: '#171717',
  };

  return markedDates;
}
