import type { ApiPaginatedData } from 'lib/api.types';
import { api, unwrapResponse } from 'lib/api';
import type { UserProfile } from 'lib/auth.types';

export function getProfile() {
  return unwrapResponse<UserProfile>(api.get('/v1/user/profile'));
}

interface GetUsersDirectoryParams {
  page?: number;
  pageSize?: number;
  q?: string;
}

export async function getUsersDirectory(params?: GetUsersDirectoryParams) {
  const response = await unwrapResponse<ApiPaginatedData<UserProfile>>(
    api.get('/v1/user/all', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        q: params?.q?.trim() || undefined,
      },
    })
  );

  return response.items;
}
