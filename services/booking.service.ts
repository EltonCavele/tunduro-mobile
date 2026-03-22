import type { ApiPaginatedData } from 'lib/api.types';
import { api, unwrapResponse } from 'lib/api';
import type { BookingItem } from 'lib/calendar-bookings';

interface GetMyBookingsPageParams {
  page?: number;
  pageSize?: number;
}

const DEFAULT_BOOKINGS_PAGE_SIZE = 100;

export function getMyBookingsPage(params?: GetMyBookingsPageParams) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? DEFAULT_BOOKINGS_PAGE_SIZE;

  return unwrapResponse<ApiPaginatedData<BookingItem>>(
    api.get('/v1/bookings/me', {
      params: {
        page,
        pageSize,
      },
    })
  );
}

export async function getAllMyBookings() {
  const uniqueBookings = new Map<string, BookingItem>();
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await getMyBookingsPage({
      page: currentPage,
      pageSize: DEFAULT_BOOKINGS_PAGE_SIZE,
    });

    response.items.forEach((booking) => {
      uniqueBookings.set(booking.id, booking);
    });

    totalPages = Math.max(response.metadata.totalPages, 1);
    currentPage += 1;
  }

  return Array.from(uniqueBookings.values());
}
