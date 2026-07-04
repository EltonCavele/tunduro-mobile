import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { userContactQueryKeys } from 'lib/query-keys';
import { getUserContacts } from 'services/user.service';

interface UseUserContactsQueryOptions {
  enabled?: boolean;
}

export function useUserContactsQuery(searchQuery: string, options?: UseUserContactsQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();
  const normalizedQuery = searchQuery.trim();

  return useQuery({
    queryKey: userContactQueryKeys.list(normalizedQuery),
    queryFn: () =>
      getUserContacts({
        page: 1,
        pageSize: 20,
        q: normalizedQuery || undefined,
      }),
    enabled: (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 30_000,
  });
}
