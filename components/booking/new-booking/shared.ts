import type { BookingHourSlot } from 'lib/booking-reservation';

export const DEFAULT_COURT_IMAGE = require('../../../assets/imgs/tennis.jpg');

export interface SelectableTimeSlot extends BookingHourSlot {
  accentColors: readonly [string, string];
  isCourtBlocked: boolean;
  isDisabled: boolean;
  isLeadTimeBlocked: boolean;
  isOrganizerBlocked: boolean;
  isSelected: boolean;
}
