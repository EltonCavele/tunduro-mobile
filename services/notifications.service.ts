import { api, unwrapResponse } from 'lib/api';

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
