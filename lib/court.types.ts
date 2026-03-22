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

export interface CourtBooking {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
}
