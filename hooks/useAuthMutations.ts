import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserProfile } from 'lib/auth.types';
import { authQueryKeys } from 'lib/query-keys';
import * as authService from 'services/auth.service';

import { useAuthSession } from './useAuthSession';

export function useSignInMutation() {
  const { applyAuthResponse } = useAuthSession();

  return useMutation({
    mutationFn: authService.signIn,
    onSuccess: async (response) => {
      await applyAuthResponse(response);
    },
    onError: (error) => {
      console.log(JSON.stringify(error, null, 3));
    },
  });
}

export function useSignUpMutation() {
  const { applyAuthResponse } = useAuthSession();

  return useMutation({
    mutationFn: authService.signUp,
    onSuccess: async (response) => {
      await applyAuthResponse(response);
    },
  });
}

export function useRequestVerificationOtpMutation() {
  return useMutation({
    mutationFn: authService.requestVerificationOtp,
  });
}

export function useVerifyAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.verifyAccount,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.profile, (currentProfile: UserProfile | undefined) =>
        currentProfile
          ? {
              ...currentProfile,
              isVerified: true,
            }
          : currentProfile
      );

      queryClient.invalidateQueries({
        queryKey: authQueryKeys.profile,
      });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
}

export function useLogoutAllDevicesMutation() {
  const { clearSession } = useAuthSession();

  return useMutation({
    mutationFn: authService.logoutAllDevices,
    onSuccess: async () => {
      await clearSession();
    },
  });
}
