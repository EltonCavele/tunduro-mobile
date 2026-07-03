export type PaymentType =
  | 'ADMIN_ADJUSTMENT'
  | 'BOOKING'
  | 'CANCELLATION_PENALTY'
  | 'CANCELLATION_REFUND'
  | 'OVERTIME_ADJUSTMENT'
  | 'RESCHEDULE_DIFFERENCE'
  | 'RESCHEDULE_FEE'
  | 'WAITLIST_CLAIM'
  | 'WALLET_TOP_UP';

export type PaymentStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'FAILED'
  | 'PENDING'
  | 'PROCESSING'
  | 'REFUNDED';

export interface PaymentBooking {
  id: string;
  courtId: string;
  organizerId: string;
  startAt: string;
  endAt: string;
  status: string;
}

export interface Payment {
  id: string;
  bookingId: string | null;
  userId: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  reference: string;
  metadata: Record<string, any>;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  booking: PaymentBooking | null;
}
