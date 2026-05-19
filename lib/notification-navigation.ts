import type { Router } from 'expo-router';

export function navigateFromNotificationData(
  router: Router,
  data: Record<string, unknown> | null | undefined
) {
  if (!data) {
    return;
  }

  const type = typeof data.type === 'string' ? data.type : undefined;
  const bookingId = typeof data.bookingId === 'string' ? data.bookingId : undefined;
  const sessionId = typeof data.sessionId === 'string' ? data.sessionId : undefined;

  if (type === 'checkoutSession' && sessionId) {
    router.push({
      pathname: '/checkout/[sessionId]',
      params: { sessionId },
    });
    return;
  }

  if (bookingId && (type === 'booking' || type === 'invitation' || !type)) {
    router.push({
      pathname: '/bookings/[id]',
      params: { id: bookingId },
    });
  }
}
