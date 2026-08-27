export type CourtType = 'INDOOR' | 'OUTDOOR';

export type CourtClosureCategory = 'EVENT' | 'MAINTENANCE' | 'OTHER';

export const COURT_CLOSURE_CATEGORY_LABELS: Record<CourtClosureCategory, string> = {
  EVENT: 'Evento',
  MAINTENANCE: 'Manutenção',
  OTHER: 'Outro motivo',
};

export interface CourtImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  surface: string;
  hasLighting: boolean;
  lightingDeviceId?: string[];
  lightingEnabled?: boolean;
  rules: string | null;
  pricePerHour: number;
  memberPricePerHour: number;
  memberWeekendFree: boolean;
  lightingPricePerHour: number;
  currency: string;
  maxPlayers: number;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  images: CourtImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CourtBookingOrganizer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface CourtBooking {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  /**
   * Optional richer fields. The court bookings endpoint currently only returns
   * id/startAt/endAt/status, but the schedule UI renders the reserver's name and
   * guest count as soon as the backend starts exposing any of these.
   */
  organizerId?: string | null;
  organizer?: CourtBookingOrganizer | null;
  participantCount?: number | null;
  guestCount?: number | null;
}

export interface CourtClosure {
  id: string;
  courtId?: string;
  startAt: string;
  endAt: string;
  category: CourtClosureCategory;
  reason: string;
  createdAt?: string;
}
