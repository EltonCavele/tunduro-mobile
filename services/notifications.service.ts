import type { ApiGenericResponse, ApiPaginatedData } from 'lib/api.types';
import { api, unwrapResponse } from 'lib/api';
import type { AppNotification, GetNotificationsParams } from 'lib/notifications.types';

export interface NotificationPreferences {
  notifyPush: boolean;
  notifySms: boolean;
  notifyEmail: boolean;
}

export const registerExpoPushToken = async (expoPushToken: string): Promise<void> => {
  await api.put('/v1/user/expo-push-token', { expoPushToken });
};

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  return unwrapResponse(api.get('/v1/user/notification-preferences'));
};

export const updateNotificationPreferences = async (
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> => {
  return unwrapResponse(api.put('/v1/user/notification-preferences', prefs));
};

export function getNotifications(params?: GetNotificationsParams) {
  return unwrapResponse<ApiPaginatedData<AppNotification>>(
    api.get('/v1/notifications', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(typeof params?.isRead === 'boolean' ? { isRead: params.isRead } : {}),
      },
    })
  );
}

export function markNotificationAsRead(notificationId: string) {
  return unwrapResponse<AppNotification>(api.post(`/v1/notifications/${notificationId}/read`));
}

export function deleteNotification(notificationId: string) {
  return unwrapResponse<ApiGenericResponse>(api.delete(`/v1/notifications/${notificationId}`));
}
