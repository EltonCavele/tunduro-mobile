export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationReadFilter = 'all' | 'unread' | 'read';

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}
