import { useEffect } from 'react';

import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export function usePushDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        bookingId?: string;
        sessionId?: string;
        type?: 'booking' | 'checkoutSession';
      };

      if (data.type === 'checkoutSession' && data.sessionId) {
        router.push({
          pathname: '/checkout/[sessionId]',
          params: { sessionId: data.sessionId },
        });
        return;
      }

      if (data.type === 'booking' && data.bookingId) {
        router.push({
          pathname: '/bookings/[id]',
          params: { id: data.bookingId },
        });
      }
    });

    return () => subscription.remove();
  }, [router]);
}
