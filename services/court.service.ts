import type { ApiPaginatedData } from 'lib/api.types';
import { api, unwrapResponse } from 'lib/api';
import { getClubDayRange } from 'lib/booking-reservation';
import type { Court, CourtBooking } from 'lib/court.types';

interface CourtListParams {
  page?: number;
  pageSize?: number;
}

interface CourtBookingsParams extends CourtListParams {
  endAt: string;
  startAt: string;
}

const DEFAULT_COURTS_PAGE_SIZE = 100;

export function getCourtsPage(params?: CourtListParams) {
  return unwrapResponse<ApiPaginatedData<Court>>(
    api.get('/v1/courts', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? DEFAULT_COURTS_PAGE_SIZE,
      },
    })
  );
}

export async function getAllCourts() {
  const uniqueCourts = new Map<string, Court>();
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await getCourtsPage({
      page: currentPage,
      pageSize: DEFAULT_COURTS_PAGE_SIZE,
    });

    response.items.forEach((court) => {
      uniqueCourts.set(court.id, court);
    });

    totalPages = Math.max(response.metadata.totalPages, 1);
    currentPage += 1;
  }

  return Array.from(uniqueCourts.values());
}

export function getCourt(courtId: string) {
  return unwrapResponse<Court>(api.get(`/v1/courts/${courtId}`));
}

export function getCourtBookingsPage(courtId: string, params: CourtBookingsParams) {
  return unwrapResponse<ApiPaginatedData<CourtBooking>>(
    api.get(`/v1/courts/${courtId}/bookings`, {
      params: {
        endAt: params.endAt,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_COURTS_PAGE_SIZE,
        startAt: params.startAt,
      },
    })
  );
}

export async function getCourtDayBookings(courtId: string, dateKey: string) {
  const { endAt, startAt } = getClubDayRange(dateKey);
  const uniqueBookings = new Map<string, CourtBooking>();
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await getCourtBookingsPage(courtId, {
      endAt,
      page: currentPage,
      pageSize: DEFAULT_COURTS_PAGE_SIZE,
      startAt,
    });

    response.items.forEach((booking) => {
      uniqueBookings.set(booking.id, booking);
    });

    totalPages = Math.max(response.metadata.totalPages, 1);
    currentPage += 1;
  }

  return Array.from(uniqueBookings.values());
}
