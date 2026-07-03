import type { Role } from 'lib/auth.types';
import type { Court } from 'lib/court.types';

export type BookingPaymentMethod = 'MPESA' | 'EMOLA' | 'CARD' | 'CLUB_BALANCE';

export const BOOKING_PAYMENT_METHOD_LABELS: Record<BookingPaymentMethod, string> = {
  CARD: 'Cartao Bancario',
  CLUB_BALANCE: 'Saldo do clube',
  EMOLA: 'E-Mola',
  MPESA: 'M-Pesa',
};

export function getBookingHourlyPrice(
  court: Court,
  role?: Role | null,
  lightingRequested = false
) {
  const basePrice =
    role === 'MEMBER' ? court.memberPricePerHour ?? court.pricePerHour : court.pricePerHour;
  const lightingPrice = lightingRequested ? court.lightingPricePerHour ?? 0 : 0;

  return basePrice + lightingPrice;
}

export function getBookingTotalPrice(
  court: Court,
  role: Role | null | undefined,
  durationHours: number,
  lightingRequested = false
) {
  return Number(
    (getBookingHourlyPrice(court, role, lightingRequested) * durationHours).toFixed(2)
  );
}
