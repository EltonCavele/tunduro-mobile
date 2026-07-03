import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserProfile } from 'lib/auth.types';
import { authQueryKeys } from 'lib/query-keys';
import { deleteMyAccount, updateProfile } from 'services/user.service';

import { useAuthSession } from './useAuthSession';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(authQueryKeys.profile, (currentProfile: UserProfile | undefined) =>
        currentProfile ? { ...currentProfile, ...updatedProfile } : updatedProfile
      );

      queryClient.invalidateQueries({
        queryKey: authQueryKeys.profile,
      });
    },
  });
}

export function useDeleteAccountMutation() {
  const { clearSession } = useAuthSession();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: async () => {
      await clearSession();
    },
  });
}
