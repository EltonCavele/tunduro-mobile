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
}

export interface BookingStatusHistoryItem {
  createdAt: string;
  fromStatus: string;
  reason: string | null;
  toStatus: string;
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
  status: string;
  statusHistory: BookingStatusHistoryItem[];
  totalPrice: number;
  updatedAt: string;
}

export interface BookingListResponse {
  data: {
    items: BookingItem[];
    metadata: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface CalendarReservation {
  accentColor: string;
  courtLabel: string;
  dateKey: string;
  endLabel: string;
  id: string;
  participantCount: number;
  startAt: string;
  startLabel: string;
  status: string;
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

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#45C78B',
  CONFIRMED: '#7C9EE6',
  PENDING: '#FF7426',
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

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatTimeLabel(date: Date) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function createIsoAt(dayOffset: number, hour: number, minute: number) {
  const date = parseDateKey(getTodayDateKey());

  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);

  return date.toISOString();
}

function deriveCourtLabel(courtId: string) {
  const normalizedCourtId = courtId.replace(/[^a-zA-Z0-9]/g, '');
  const suffix = normalizedCourtId.slice(-2).toUpperCase();

  if (!suffix) {
    return 'Quadra reservada';
  }

  return `Quadra ${suffix}`;
}

function getReservationColor(status: string) {
  return STATUS_COLORS[status] || '#6B7280';
}

function createParticipant(userId: string, isOrganizer = false): BookingParticipant {
  return {
    isOrganizer,
    status: isOrganizer ? 'CONFIRMED' : 'INVITED',
    userId,
  };
}

function createMockBooking(params: {
  courtId: string;
  dayOffset: number;
  durationMinutes: number;
  id: string;
  participantIds: string[];
  status: string;
  time: [number, number];
}) {
  const [hour, minute] = params.time;
  const startAt = createIsoAt(params.dayOffset, hour, minute);
  const endDate = new Date(startAt);

  endDate.setMinutes(endDate.getMinutes() + params.durationMinutes);

  return {
    checkedInAt: null,
    courtId: params.courtId,
    createdAt: startAt,
    currency: 'MZN',
    durationMinutes: params.durationMinutes,
    endAt: endDate.toISOString(),
    id: params.id,
    invitations: [],
    organizerId: 'user-organizer',
    paidAmount: 0,
    participants: params.participantIds.map((userId, index) =>
      createParticipant(userId, index === 0)
    ),
    paymentDueAt: null,
    payments: [
      {
        amount: 0,
        currency: 'MZN',
        id: `payment-${params.id}`,
        processedAt: null,
        reference: `REF-${params.id}`,
        status: params.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
        type: 'BOOKING',
      },
    ],
    seriesId: null,
    startAt,
    status: params.status,
    statusHistory: [
      {
        createdAt: startAt,
        fromStatus: params.status,
        reason: null,
        toStatus: params.status,
      },
    ],
    totalPrice: 0,
    updatedAt: startAt,
  };
}

export const mockBookingsResponse: BookingListResponse = {
  data: {
    items: [
      createMockBooking({
        courtId: 'court-01',
        dayOffset: 0,
        durationMinutes: 60,
        id: 'booking-001',
        participantIds: ['user-organizer', 'user-002', 'user-003'],
        status: 'PENDING',
        time: [9, 0],
      }),
      createMockBooking({
        courtId: 'court-02',
        dayOffset: 0,
        durationMinutes: 60,
        id: 'booking-002',
        participantIds: ['user-organizer', 'user-004', 'user-005', 'user-006'],
        status: 'CONFIRMED',
        time: [10, 30],
      }),
      createMockBooking({
        courtId: '',
        dayOffset: 0,
        durationMinutes: 90,
        id: 'booking-003',
        participantIds: [],
        status: 'COMPLETED',
        time: [18, 0],
      }),
      createMockBooking({
        courtId: 'court-03',
        dayOffset: 1,
        durationMinutes: 60,
        id: 'booking-004',
        participantIds: ['user-organizer', 'user-007'],
        status: 'CONFIRMED',
        time: [8, 0],
      }),
      createMockBooking({
        courtId: 'court-04',
        dayOffset: 3,
        durationMinutes: 60,
        id: 'booking-005',
        participantIds: ['user-organizer', 'user-008'],
        status: 'UNKNOWN',
        time: [16, 0],
      }),
    ],
    metadata: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 5,
      totalPages: 1,
    },
  },
  message: 'booking.success.list',
  statusCode: 200,
  timestamp: new Date().toISOString(),
};

export function getTodayDateKey() {
  return formatDateKey(new Date());
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

export function adaptBookingsResponse(response: BookingListResponse) {
  return response.data.items
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
      reservations.find((reservation) => reservation.status === 'CONFIRMED')
        ?.accentColor || reservations[0]?.accentColor || '#1F3125';

    markedDates[dateKey] = {
      dotColor: accentColor,
      marked: true,
    };
  });

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#FF7A33',
    selectedTextColor: '#FFFFFF',
  };

  return markedDates;
}
