export type PaymentType = 'BOOKING' | 'REFUND' | 'CREDIT';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';


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
  bookingId: string;
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
  booking?: PaymentBooking;
}
