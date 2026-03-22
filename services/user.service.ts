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

const DEFAULT_USERS_PAGE_SIZE = 100;

export function getUsersDirectoryPage(params?: GetUsersDirectoryParams) {
  return unwrapResponse<ApiPaginatedData<UserProfile>>(
    api.get('/v1/user/all', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? DEFAULT_USERS_PAGE_SIZE,
        q: params?.q?.trim() || undefined,
      },
    })
  );
}

export async function getUsersDirectory(params?: GetUsersDirectoryParams) {
  const response = await getUsersDirectoryPage(params);

  return response.items;
}

export async function findUsersByIds(userIds: string[]) {
  const normalizedUserIds = Array.from(
    new Set(userIds.map((userId) => userId.trim()).filter(Boolean))
  );

  if (normalizedUserIds.length === 0) {
    return [];
  }

  const remainingUserIds = new Set(normalizedUserIds);
  const resolvedUsers = new Map<string, UserProfile>();
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages && remainingUserIds.size > 0) {
    const response = await getUsersDirectoryPage({
      page: currentPage,
      pageSize: DEFAULT_USERS_PAGE_SIZE,
    });

    response.items.forEach((user) => {
      if (remainingUserIds.has(user.id)) {
        resolvedUsers.set(user.id, user);
        remainingUserIds.delete(user.id);
      }
    });

    totalPages = Math.max(response.metadata.totalPages, 1);
    currentPage += 1;
  }

  return normalizedUserIds
    .map((userId) => resolvedUsers.get(userId))
    .filter((user): user is UserProfile => Boolean(user));
}
