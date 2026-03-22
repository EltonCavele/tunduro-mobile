export const authQueryKeys = {
  all: ['auth'] as const,
  profile: ['auth', 'profile'] as const,
};

export const bookingQueryKeys = {
  all: ['bookings'] as const,
  myReservations: ['bookings', 'me'] as const,
  create: ['bookings', 'create'] as const,
};

export const courtQueryKeys = {
  all: ['courts'] as const,
  list: ['courts', 'list'] as const,
  bookings: ['courts', 'bookings'] as const,
  dayBookings: (courtId: string, dateKey: string) =>
    ['courts', 'bookings', courtId, dateKey] as const,
};

export const userDirectoryQueryKeys = {
  all: ['user-directory'] as const,
  search: (query: string) => ['user-directory', 'search', query] as const,
};
