import { useLocalSearchParams, useRouter } from 'expo-router';

import { BookingDetailsSheet } from 'components/booking/BookingDetailsSheet';

export default function BookingDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = typeof params.id === 'string' ? params.id.trim() : null;

  return <BookingDetailsSheet bookingId={bookingId} onClose={() => router.back()} />;
}
