import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import { registerExpoPushToken } from 'services/notifications.service';

const PROMPT_SEEN_KEY = 'expo_push_prompt_seen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotificationSetup() {
  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
    null
  );

  useEffect(() => {
    async function checkStatus() {
      const seen = await SecureStore.getItemAsync(PROMPT_SEEN_KEY);
      setHasSeenPrompt(seen === 'true');

      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);

      if (status === Notifications.PermissionStatus.GRANTED) {
        await silentlyRegisterToken();
      }
    }

    void checkStatus();
  }, []);

  async function silentlyRegisterToken() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      if (tokenData?.data) {
        await registerExpoPushToken(tokenData.data);
      }
    } catch (e) {
      console.log('Failed to register push token silently:', e);
    }
  }

  async function requestAndRegister() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      await SecureStore.setItemAsync(PROMPT_SEEN_KEY, 'true');
      setHasSeenPrompt(true);

      if (status === Notifications.PermissionStatus.GRANTED) {
        await silentlyRegisterToken();
      }

      return status === Notifications.PermissionStatus.GRANTED;
    } catch (e) {
      console.log('Failed to request permissions:', e);
      return false;
    }
  }

  async function dismissPrompt() {
    await SecureStore.setItemAsync(PROMPT_SEEN_KEY, 'true');
    setHasSeenPrompt(true);
  }

  return {
    permissionStatus,
    hasSeenPrompt,
    requestAndRegister,
    dismissPrompt,
  };
}
