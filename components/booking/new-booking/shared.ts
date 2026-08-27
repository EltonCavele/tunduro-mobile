import type { BookingHourSlot } from 'lib/booking-reservation';
import type { CourtClosure } from 'lib/court.types';

export const DEFAULT_COURT_IMAGE = require('../../../assets/imgs/tennis.jpg');

export interface SelectableTimeSlot extends BookingHourSlot {
  accentColors: readonly [string, string];
  closure: CourtClosure | null;
  isCourtBlocked: boolean;
  isDisabled: boolean;
  isLeadTimeBlocked: boolean;
  isOrganizerBlocked: boolean;
  isSelected: boolean;
}
