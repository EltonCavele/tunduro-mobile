import { useEffect } from 'react';

import { useRouter } from 'expo-router';

import {
  clearActiveCheckoutSessionId,
  getActiveCheckoutSessionId,
} from 'lib/active-checkout-storage';
import { useAuthSession } from 'hooks/useAuthSession';
import { BookingCheckoutSessionStatus, getBookingCheckoutSession } from 'services/booking.service';

const NON_RESUMABLE_STATUSES = new Set<BookingCheckoutSessionStatus>([
  BookingCheckoutSessionStatus.COMPLETED,
  BookingCheckoutSessionStatus.EXPIRED,
  BookingCheckoutSessionStatus.PAYMENT_FAILED,
  BookingCheckoutSessionStatus.REFUNDED,
]);

export function useResumeActiveCheckout() {
  const router = useRouter();
  const { hasSession, isHydrated } = useAuthSession();

  useEffect(() => {
    if (!isHydrated || !hasSession) {
      return;
    }

    let isCancelled = false;

    async function resumeCheckout() {
      const activeSessionId = await getActiveCheckoutSessionId();

      if (!activeSessionId || isCancelled) {
        return;
      }

      try {
        const session = await getBookingCheckoutSession(activeSessionId);

        if (NON_RESUMABLE_STATUSES.has(session.status)) {
          await clearActiveCheckoutSessionId();
          return;
        }

        router.push({
          pathname: '/checkout/[sessionId]',
          params: { sessionId: activeSessionId },
        });
      } catch {
        await clearActiveCheckoutSessionId();
      }
    }

    void resumeCheckout();

    return () => {
      isCancelled = true;
    };
  }, [hasSession, isHydrated, router]);
}
