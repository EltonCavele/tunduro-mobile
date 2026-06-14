export type WalletTransactionType = 'TOP_UP' | 'BOOKING_DEBIT' | 'ADMIN_ADJUSTMENT';

export interface WalletTransaction {
  id: string;
  userId: string;
  createdByUserId: string | null;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  currency: string;
  reference: string;
  bookingId: string | null;
  paymentReference: string | null;
  note: string | null;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}
