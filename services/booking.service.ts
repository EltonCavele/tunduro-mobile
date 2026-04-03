import type { ApiPaginatedData } from 'lib/api.types';
import { api, unwrapResponse } from 'lib/api';
import type { BookingItem } from 'lib/calendar-bookings';

interface GetMyBookingsPageParams {
  page?: number;
  pageSize?: number;
}

const DEFAULT_BOOKINGS_PAGE_SIZE = 100;

export interface CreateBookingPayload {
  courtId: string;
  endAt: string;
  participantUserIds?: string[];
  startAt: string;
}

export enum BookingCheckoutSessionStatus {
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FINALIZING = 'FINALIZING',
  OPEN = 'OPEN',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUNDED = 'REFUNDED',
  REFUND_PENDING = 'REFUND_PENDING',
}

export interface BookingCheckoutSession {
  amount: number;
  bookingId: string | null;
  checkoutUrl: string | null;
  completedAt: string | null;
  courtId: string;
  createdAt: string;
  currency: string;
  durationMinutes: number;
  endAt: string;
  expiresAt: string;
  failureReason: string | null;
  id: string;
  paidAt: string | null;
  paymentMethod: string | null;
  reference: string;
  refundedAt: string | null;
  startAt: string;
  status: BookingCheckoutSessionStatus;
  updatedAt: string;
}

export interface CancelBookingPayload {
  bookingId: string;
  reason?: string;
}

export interface RespondToBookingInvitationPayload {
  action: 'accept' | 'decline';
  bookingId: string;
  token: string;
}

export function getMyBookingsPage(params?: GetMyBookingsPageParams) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? DEFAULT_BOOKINGS_PAGE_SIZE;

  return unwrapResponse<ApiPaginatedData<BookingItem>>(
    api.get('/v1/bookings/me', {
      params: {
        page,
        pageSize,
      },
    })
  );
}

export async function getAllMyBookings() {
  const uniqueBookings = new Map<string, BookingItem>();
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await getMyBookingsPage({
      page: currentPage,
      pageSize: DEFAULT_BOOKINGS_PAGE_SIZE,
    });

    response.items.forEach((booking) => {
      uniqueBookings.set(booking.id, booking);
    });

    totalPages = Math.max(response.metadata.totalPages, 1);
    currentPage += 1;
  }

  return Array.from(uniqueBookings.values());
}

export function getBookingDetails(bookingId: string) {
  return unwrapResponse<BookingItem>(api.get(`/v1/bookings/${bookingId}`));
}

export function startBookingCheckout(payload: CreateBookingPayload) {
  return unwrapResponse<BookingCheckoutSession>(api.post('/v1/bookings/checkout', payload));
}

export function getBookingCheckoutSession(sessionId: string) {
  return unwrapResponse<BookingCheckoutSession>(api.get(`/v1/bookings/checkout/${sessionId}`));
}

export function refreshBookingCheckoutSession(sessionId: string) {
  return unwrapResponse<BookingCheckoutSession>(
    api.post(`/v1/bookings/checkout/${sessionId}/refresh`)
  );
}

export function confirmBookingPayment(bookingId: string) {
  return unwrapResponse<BookingItem>(
    api.post(`/v1/bookings/${bookingId}/payments/mock/confirm`, {
      applyToSeries: false,
    })
  );
}

export function cancelBooking(payload: CancelBookingPayload) {
  return unwrapResponse<BookingItem>(
    api.post(`/v1/bookings/${payload.bookingId}/cancel`, {
      reason: payload.reason?.trim() || undefined,
    })
  );
}

export function respondToBookingInvitation(payload: RespondToBookingInvitationPayload) {
  return unwrapResponse<BookingItem>(
    api.post(`/v1/invitations/${payload.token}/respond`, {
      action: payload.action,
    })
  );
}
