import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userContactQueryKeys } from 'lib/query-keys';
import {
  createUserContact,
  deleteUserContact,
  inviteUserContact,
  type CreateUserContactPayload,
} from 'services/user.service';

export function useCreateUserContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userContactQueryKeys.create,
    mutationFn: (payload: CreateUserContactPayload) => createUserContact(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userContactQueryKeys.all });
    },
  });
}

export function useDeleteUserContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userContactQueryKeys.delete,
    mutationFn: (contactId: string) => deleteUserContact(contactId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userContactQueryKeys.all });
    },
  });
}

export function useInviteUserContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...userContactQueryKeys.create, 'invite'],
    mutationFn: (payload: CreateUserContactPayload) => inviteUserContact(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userContactQueryKeys.all });
    },
  });
}
