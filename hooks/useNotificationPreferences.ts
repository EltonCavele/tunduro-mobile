import { useQuery } from '@tanstack/react-query';

import { notificationQueryKeys } from 'lib/query-keys';
import { getNotificationPreferences } from 'services/notifications.service';

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences,
    queryFn: getNotificationPreferences,
  });
}
