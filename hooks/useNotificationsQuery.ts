import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { NotificationReadFilter } from 'lib/notifications.types';
import { notificationQueryKeys } from 'lib/query-keys';
import { getNotifications } from 'services/notifications.service';

import { useAuthSession } from './useAuthSession';

const PAGE_SIZE = 20;

function getIsReadFilter(filter: NotificationReadFilter): boolean | undefined {
  if (filter === 'read') {
    return true;
  }

  if (filter === 'unread') {
    return false;
  }

  return undefined;
}

function useNotificationsEnabled() {
  const { hasSession, isHydrated } = useAuthSession();

  return isHydrated && hasSession;
}

export function useNotificationsQuery(filter: NotificationReadFilter = 'all') {
  const isRead = getIsReadFilter(filter);
  const paramsKey = `${filter}-${isRead ?? 'all'}`;
  const enabled = useNotificationsEnabled();

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(paramsKey),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getNotifications({
        page: pageParam,
        pageSize: PAGE_SIZE,
        isRead,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}

export function useUnreadNotificationsCount() {
  const enabled = useNotificationsEnabled();

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    enabled,
    queryFn: () =>
      getNotifications({
        page: 1,
        pageSize: 1,
        isRead: false,
      }),
    select: (data) => data.metadata.totalItems,
  });
}
