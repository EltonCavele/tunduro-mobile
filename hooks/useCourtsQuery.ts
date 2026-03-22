import { useQuery } from '@tanstack/react-query';

import { useAuthSession } from 'hooks/useAuthSession';
import { courtQueryKeys } from 'lib/query-keys';
import { getAllCourts } from 'services/court.service';

export function useCourtsQuery() {
  const { hasSession, isHydrated } = useAuthSession();

  return useQuery({
    queryKey: courtQueryKeys.list,
    queryFn: getAllCourts,
    enabled: isHydrated && hasSession,
    staleTime: 5 * 60_000,
    select: (courts) =>
      courts
        .filter((court) => court.isActive)
        .sort((left, right) => left.name.localeCompare(right.name)),
  });
}
