export type CourtType = 'INDOOR' | 'OUTDOOR';

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
  rules: string | null;
  pricePerHour: number;
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
