import { api, unwrapResponse } from 'lib/api';
import type { Wallet } from 'lib/wallet.types';

export interface WalletTopUpPayload {
  amount: number;
}

export enum WalletTopUpSessionStatus {
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  OPEN = 'OPEN',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export interface WalletTopUpSession {
  amount: number;
  checkoutUrl: string | null;
  completedAt: string | null;
  createdAt: string;
  currency: string;
  expiresAt: string;
  failureReason: string | null;
  id: string;
  paidAt: string | null;
  paymentMethod: string | null;
  phone: string | null;
  reference: string;
  status: WalletTopUpSessionStatus;
  updatedAt: string;
  userId: string;
}

export function getMyWallet() {
  return unwrapResponse<Wallet>(api.get('/v1/wallet/me'));
}

export function topUpMyWallet(payload: WalletTopUpPayload) {
  return unwrapResponse<WalletTopUpSession>(api.post('/v1/wallet/me/top-ups', payload));
}

export function getWalletTopUpSession(sessionId: string) {
  return unwrapResponse<WalletTopUpSession>(api.get(`/v1/wallet/me/top-ups/${sessionId}`));
}

export function refreshWalletTopUpSession(sessionId: string) {
  return unwrapResponse<WalletTopUpSession>(
    api.post(`/v1/wallet/me/top-ups/${sessionId}/refresh`)
  );
}
