import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { userDirectoryQueryKeys } from 'lib/query-keys';
import { findUsersByIds } from 'services/user.service';

interface UseBookingUsersQueryOptions {
  enabled?: boolean;
}

export function useBookingUsersQuery(userIds: string[], options?: UseBookingUsersQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedUserIds = useMemo(
    () => Array.from(new Set(userIds.map((userId) => userId.trim()).filter(Boolean))).sort(),
    [userIds]
  );
  const userIdsKey = normalizedUserIds.join(',');

  return useQuery({
    queryKey: userDirectoryQueryKeys.byIds(userIdsKey || 'idle'),
    queryFn: () => findUsersByIds(normalizedUserIds),
    enabled: normalizedUserIds.length > 0 && (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 60_000,
  });
}
