import { api, unwrapResponse } from 'lib/api';
import type { Wallet } from 'lib/wallet.types';

export function getMyWallet() {
  return unwrapResponse<Wallet>(api.get('/v1/wallet/me'));
}
