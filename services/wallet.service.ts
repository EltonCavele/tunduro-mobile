import { api, unwrapResponse } from 'lib/api';
import type { Wallet } from 'lib/wallet.types';

export interface WalletTopUpPayload {
  amount: number;
  phone: string;
}

export function getMyWallet() {
  return unwrapResponse<Wallet>(api.get('/v1/wallet/me'));
}

export function topUpMyWallet(payload: WalletTopUpPayload) {
  return unwrapResponse<Wallet>(api.post('/v1/wallet/me/top-ups', payload));
}
