import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName, getUserInitials } from 'lib/auth-utils';
import { formatTimeRangeLabel } from 'lib/booking-reservation';
import {
  type BookingItem,
  BookingStatus,
  deriveCourtLabel,
  getBookingStatusLabel,
} from 'lib/calendar-bookings';
import { formatCourtTypeLabel } from 'lib/court-utils';

export interface BookingPersonViewModel {
  avatarUrl: string | null;
  id: string;
  initials: string;
  label: string;
  metaLabel: string | null;
  phoneLabel: string | null;
  statusLabel: string | null;
}

export interface BookingDetailsViewModel {
  dateLabel: string;
  durationLabel: string;
  locationLabel: string;
  locationMetaLabel: string;
  organizer: BookingPersonViewModel;
  participants: BookingPersonViewModel[];
  paymentStateLabel: string;
  shareMessage: string;
  statusLabel: string;
  timeLabel: string;
  title: string;
}

export type PendingConfirmationAction =
  | 'cancel-booking'
  | 'decline-invitation'
  | 'extend-booking'
  | null;

export function formatCurrencyValue(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency || 'MZN',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'MZN'}`;
  }
}

export function formatCheckInTimeLabel(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isAcceptedBookingMember(booking: BookingItem, userId: string | undefined) {
  if (!userId) {
    return false;
  }

  if (booking.organizerId === userId) {
    return true;
  }

  return (booking.participants ?? []).some(
    (participant) => participant.userId === userId && participant.status === 'ACCEPTED'
  );
}

export function isNearBookingEnd(endAt: string, nowMs: number) {
  const endMs = new Date(endAt).getTime();

  if (Number.isNaN(endMs)) {
    return false;
  }

  const diffMs = endMs - nowMs;

  return diffMs <= 15 * 60_000 && diffMs >= -10 * 60_000;
}

export function formatExtensionEndLabel(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isUserParticipantOnBooking(booking: BookingItem, userId: string | undefined) {
  if (!userId) {
    return false;
  }

  if (booking.organizerId === userId) {
    return true;
  }

  return (booking.participants ?? []).some((participant) => participant.userId === userId);
}

export function isBookingCheckInTime(startAt: string, nowMs: number) {
  const startMs = new Date(startAt).getTime();

  if (Number.isNaN(startMs)) {
    return false;
  }

  return nowMs >= startMs;
}

export function getSessionCountdownParts(
  targetAtIso: string,
  mode: 'toStart' | 'toEnd',
  nowMs: number
) {
  const targetMs = new Date(targetAtIso).getTime();

  if (Number.isNaN(targetMs)) {
    return { ended: true, minutesRoundedUp: 0, mmss: '0:00', mode };
  }

  const remainingMs = targetMs - nowMs;

  if (remainingMs <= 0) {
    return { ended: true, minutesRoundedUp: 0, mmss: '0:00', mode };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutesRoundedUp = Math.max(1, Math.ceil(remainingMs / 60000));

  return {
    ended: false,
    minutesRoundedUp,
    mmss: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    mode,
  };
}

export function buildBookingDetailsViewModel(
  booking: BookingItem,
  currentUser: UserProfile | null,
  relatedUsers: Map<string, UserProfile>,
  court?: {
    name: string;
    surface: string;
    type: 'INDOOR' | 'OUTDOOR';
  } | null
): BookingDetailsViewModel {
  const organizerUser =
    booking.organizerId === currentUser?.id
      ? currentUser
      : (relatedUsers.get(booking.organizerId) ?? null);
  const resolvedCourtName = court?.name ?? deriveCourtLabel(booking.courtId);
  const participants = (booking.participants ?? [])
    .filter((participant) => !participant.isOrganizer)
    .map((participant) => {
      const relatedUser =
        participant.userId === currentUser?.id
          ? currentUser
          : (relatedUsers.get(participant.userId) ?? null);

      return {
        avatarUrl: relatedUser?.avatarUrl ?? null,
        id: participant.userId,
        initials: getUserInitials(relatedUser),
        label: getResolvedUserLabel(relatedUser, participant.userId),
        metaLabel: getResolvedUserMeta(relatedUser),
        phoneLabel: relatedUser?.phone?.trim() || null,
        statusLabel: formatParticipantStatusLabel(participant.status, participant.isOrganizer),
      };
    });

  return {
    dateLabel: formatScreenDateLabel(booking.startAt),
    durationLabel: `${booking.durationMinutes} min`,
    locationLabel: resolvedCourtName,
    locationMetaLabel: court
      ? `${court.surface} • ${formatCourtTypeLabel(court.type)}`
      : 'Detalhes do campo indisponiveis',
    organizer: {
      avatarUrl: organizerUser?.avatarUrl ?? null,
      id: booking.organizerId,
      initials: getUserInitials(organizerUser),
      label: getResolvedUserLabel(organizerUser, booking.organizerId),
      metaLabel: getResolvedUserMeta(organizerUser),
      phoneLabel: organizerUser?.phone?.trim() || null,
      statusLabel: null,
    },
    participants,
    paymentStateLabel: formatPaymentStateLabel(booking),
    shareMessage: [
      resolvedCourtName,
      formatScreenDateLabel(booking.startAt),
      formatTimeRangeLabel(booking.startAt, booking.endAt),
      formatCurrencyValue(booking.totalPrice, booking.currency),
    ].join('\n'),
    statusLabel: getBookingStatusLabel(booking.status),
    timeLabel: formatTimeRangeLabel(booking.startAt, booking.endAt),
    title: resolvedCourtName,
  };
}

function formatParticipantStatusLabel(status: string, isOrganizer: boolean) {
  if (isOrganizer) {
    return 'Organizador';
  }

  switch (status) {
    case 'ACCEPTED':
      return 'Confirmado';
    case 'INVITED':
      return 'Convidado';
    case 'REMOVED':
      return 'Removido';
    case 'DECLINED':
      return 'Recusado';
    default:
      return status.replace(/_/g, ' ');
  }
}

function formatScreenDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponivel';
  }

  const formatted = new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatPaymentStateLabel(booking: BookingItem) {
  if (booking.paidAmount >= booking.totalPrice) {
    return 'Pago';
  }

  if (booking.status === BookingStatus.CANCELLED) {
    return 'Cancelado';
  }

  return 'Pagamento pendente';
}

function getFallbackUserLabel(userId?: string | null) {
  if (!userId?.trim()) {
    return 'Utilizador';
  }

  return `Utilizador ${userId.slice(-4)}`;
}

function getResolvedUserLabel(user?: UserProfile | null, fallbackUserId?: string | null) {
  if (user) {
    const displayName = getUserDisplayName(user);

    if (displayName !== 'Utilizador') {
      return displayName;
    }

    if (user.email?.trim()) {
      return user.email.trim();
    }

    if (user.phone?.trim()) {
      return user.phone.trim();
    }
  }

  return getFallbackUserLabel(fallbackUserId);
}

function getResolvedUserMeta(user?: UserProfile | null) {
  if (user?.email?.trim()) {
    return user.email.trim();
  }

  if (user?.phone?.trim()) {
    return user.phone.trim();
  }

  return null;
}
