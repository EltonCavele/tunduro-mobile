import { useProfileQuery } from './useProfileQuery';
import { useAuthSession } from './useAuthSession';

export function useAuthStatus() {
  const { hasSession, isHydrated } = useAuthSession();
  const profileQuery = useProfileQuery({
    enabled: hasSession,
  });

  const user = profileQuery.data ?? null;
  const isResolvingProfile =
    hasSession && !user && (profileQuery.isPending || profileQuery.isFetching);

  return {
    hasSession,
    isHydrated,
    isLoading: !isHydrated || isResolvingProfile,
    isVerified: Boolean(user?.isVerified),
    user,
    profileError: profileQuery.error,
  };
}
