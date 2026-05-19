import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiPaginatedData } from 'lib/api.types';
import type { AppNotification } from 'lib/notifications.types';
import { notificationQueryKeys } from 'lib/query-keys';
import { markNotificationAsRead } from 'services/notifications.service';

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: notificationQueryKeys.markRead,
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.all,
      });

      const readAt = new Date().toISOString();

      queryClient.setQueriesData<InfiniteData<ApiPaginatedData<AppNotification>>>(
        { queryKey: notificationQueryKeys.all },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === notificationId ? { ...item, readAt } : item
              ),
            })),
          };
        }
      );
    },
  });
}
