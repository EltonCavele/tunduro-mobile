import type { Role } from 'lib/auth.types';
import { CLUB_TIMEZONE } from 'lib/booking-reservation';
import type { Court } from 'lib/court.types';

export type OnlinePaymentMethod = 'MPESA' | 'EMOLA' | 'CARD';
export type BookingPaymentMethod = OnlinePaymentMethod | 'CLUB_BALANCE';

export const BOOKING_PAYMENT_METHOD_LABELS: Record<BookingPaymentMethod, string> = {
  CARD: 'Cartao Bancario',
  CLUB_BALANCE: 'Saldo do clube',
  EMOLA: 'E-Mola',
  MPESA: 'M-Pesa',
};

export function getBookingHourlyPrice(
  court: Court,
  role?: Role | null,
  lightingRequested = false,
  startAt?: string
) {
  if (isMemberWeekendFreeBooking(court, role, startAt)) {
    return 0;
  }

  const basePrice =
    role === 'MEMBER' ? (court.memberPricePerHour ?? court.pricePerHour) : court.pricePerHour;
  const lightingPrice = lightingRequested ? (court.lightingPricePerHour ?? 0) : 0;

  return basePrice + lightingPrice;
}

export function isMemberWeekendFreeBooking(
  court: Court,
  role: Role | null | undefined,
  startAt?: string
) {
  if (role !== 'MEMBER' || !court.memberWeekendFree || !startAt) {
    return false;
  }

  const startDate = new Date(startAt);

  if (Number.isNaN(startDate.getTime())) {
    return false;
  }

  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: CLUB_TIMEZONE,
    weekday: 'short',
  }).format(startDate);

  return weekday === 'Sat' || weekday === 'Sun';
}

export function getBookingTotalPrice(
  court: Court,
  role: Role | null | undefined,
  durationHours: number,
  lightingRequested = false,
  startAt?: string
) {
  return Number(
    (getBookingHourlyPrice(court, role, lightingRequested, startAt) * durationHours).toFixed(2)
  );
}
