import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationQueryKeys } from 'lib/query-keys';
import type { NotificationPreferences } from 'services/notifications.service';
import { updateNotificationPreferences } from 'services/notifications.service';

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (updated) => {
      queryClient.setQueryData(notificationQueryKeys.preferences, updated);
    },
  });
}
