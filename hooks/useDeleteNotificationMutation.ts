import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiPaginatedData } from 'lib/api.types';
import type { AppNotification } from 'lib/notifications.types';
import { notificationQueryKeys } from 'lib/query-keys';
import { deleteNotification } from 'services/notifications.service';

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: notificationQueryKeys.delete,
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: ['notifications', 'list'],
      });

      const previousNotifications = queryClient.getQueriesData<
        InfiniteData<ApiPaginatedData<AppNotification>>
      >({
        queryKey: ['notifications', 'list'],
      });

      queryClient.setQueriesData<InfiniteData<ApiPaginatedData<AppNotification>>>(
        { queryKey: ['notifications', 'list'] },
        (current) => {
          if (!current || !Array.isArray(current.pages)) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== notificationId),
            })),
          };
        }
      );

      return { previousNotifications };
    },
    onError: (_error, _notificationId, context) => {
      context?.previousNotifications.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
}
