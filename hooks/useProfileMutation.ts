import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserProfile } from 'lib/auth.types';
import { authQueryKeys } from 'lib/query-keys';
import { updateProfile } from 'services/user.service';

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
