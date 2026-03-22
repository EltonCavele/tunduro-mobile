export const authQueryKeys = {
  all: ['auth'] as const,
  profile: ['auth', 'profile'] as const,
};

export const bookingQueryKeys = {
  all: ['bookings'] as const,
  bookingCheckout: ['bookings', 'checkout'] as const,
  bookingCheckoutDetail: (sessionId: string) =>
    ['bookings', 'checkout', 'detail', sessionId] as const,
  detail: (bookingId: string) => ['bookings', 'detail', bookingId] as const,
  myReservations: ['bookings', 'me'] as const,
  cancel: ['bookings', 'cancel'] as const,
  confirmPayment: ['bookings', 'confirm-payment'] as const,
  create: ['bookings', 'create'] as const,
};

export const courtQueryKeys = {
  all: ['courts'] as const,
  detail: (courtId: string) => ['courts', 'detail', courtId] as const,
  list: ['courts', 'list'] as const,
  bookings: ['courts', 'bookings'] as const,
  dayBookings: (courtId: string, dateKey: string) =>
    ['courts', 'bookings', courtId, dateKey] as const,
};

export const userDirectoryQueryKeys = {
  all: ['user-directory'] as const,
  byIds: (userIdsKey: string) => ['user-directory', 'by-ids', userIdsKey] as const,
  search: (query: string) => ['user-directory', 'search', query] as const,
};
