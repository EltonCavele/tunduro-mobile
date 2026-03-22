import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { userDirectoryQueryKeys } from 'lib/query-keys';
import { getUsersDirectory } from 'services/user.service';

interface UseUserSearchQueryOptions {
  enabled?: boolean;
}

export function useUserSearchQuery(searchQuery: string, options?: UseUserSearchQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedQuery = searchQuery.trim();

  return useQuery({
    queryKey: userDirectoryQueryKeys.search(normalizedQuery),
    queryFn: () =>
      getUsersDirectory({
        page: 1,
        pageSize: 20,
        q: normalizedQuery || undefined,
      }),
    enabled: (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
  });
}
