import { useQuery } from '@tanstack/react-query';

import { authQueryKeys } from 'lib/query-keys';
import { getProfile } from 'services/user.service';

import { useAuthSession } from './useAuthSession';

interface UseProfileQueryOptions {
  enabled?: boolean;
}

export function useProfileQuery(options?: UseProfileQueryOptions) {
  const { hasSession, isHydrated } = useAuthSession();

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: getProfile,
    enabled: (options?.enabled ?? true) && isHydrated && hasSession,
    staleTime: 60_000,
  });
}
