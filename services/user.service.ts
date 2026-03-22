import { api, unwrapResponse } from 'lib/api';
import type { UserProfile } from 'lib/auth.types';

export function getProfile() {
  return unwrapResponse<UserProfile>(api.get('/v1/user/profile'));
}
