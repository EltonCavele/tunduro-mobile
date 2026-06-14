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
  checkIn: ['bookings', 'check-in'] as const,
  confirmPayment: ['bookings', 'confirm-payment'] as const,
  create: ['bookings', 'create'] as const,
  extend: ['bookings', 'extend'] as const,
  respondInvitation: ['bookings', 'respond-invitation'] as const,
};

export const courtQueryKeys = {
  all: ['courts'] as const,
  detail: (courtId: string) => ['courts', 'detail', courtId] as const,
  list: ['courts', 'list'] as const,
  bookings: ['courts', 'bookings'] as const,
  dayBookings: (courtId: string, dateKey: string) =>
    ['courts', 'bookings', courtId, dateKey] as const,
  weekBookings: (courtId: string, weekStartKey: string) =>
    ['courts', 'bookings', 'week', courtId, weekStartKey] as const,
};

export const userDirectoryQueryKeys = {
  all: ['user-directory'] as const,
  byIds: (userIdsKey: string) => ['user-directory', 'by-ids', userIdsKey] as const,
  search: (query: string) => ['user-directory', 'search', query] as const,
};

export const weatherQueryKeys = {
  all: ['weather'] as const,
  club: ['weather', 'club'] as const,
};

export const walletQueryKeys = {
  all: ['wallet'] as const,
  me: ['wallet', 'me'] as const,
};

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (paramsKey: string) => ['notifications', 'list', paramsKey] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  preferences: ['notifications', 'preferences'] as const,
  markRead: ['notifications', 'mark-read'] as const,
  delete: ['notifications', 'delete'] as const,
};
