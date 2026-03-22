export const authQueryKeys = {
  all: ['auth'] as const,
  profile: ['auth', 'profile'] as const,
};

export const bookingQueryKeys = {
  all: ['bookings'] as const,
  myReservations: ['bookings', 'me'] as const,
};
