import { ConfirmationModal } from 'components/app/ConfirmationModal';
import {
  BOOKING_PAYMENT_METHOD_LABELS,
  type BookingPaymentMethod,
} from 'lib/booking-pricing';
import { formatReservationDateLabel } from 'lib/booking-reservation';

type NewBookingPaymentConfirmModalProps = {
  bookingTotalLabel: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: BookingPaymentMethod;
  selectedCourtName?: string;
  selectedDate: string;
  selectedRangeLabel: string;
};

export function NewBookingPaymentConfirmModal({
  bookingTotalLabel,
  isLoading,
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  selectedCourtName,
  selectedDate,
  selectedRangeLabel,
}: NewBookingPaymentConfirmModalProps) {
  return (
    <ConfirmationModal
      cancelLabel="Voltar"
      confirmLabel={
        isLoading
          ? 'A processar...'
          : paymentMethod === 'CLUB_BALANCE'
            ? 'Usar saldo'
            : bookingTotalLabel
              ? 'Pagar'
              : 'Pagar'
      }
      description={
        paymentMethod === 'CLUB_BALANCE'
          ? `${selectedCourtName ?? 'Campo'} - ${formatReservationDateLabel(selectedDate)}${
              selectedRangeLabel ? `, ${selectedRangeLabel}` : ''
            }. Total: ${bookingTotalLabel ?? 'por confirmar'}.`
          : `Vamos abrir o pagamento por ${BOOKING_PAYMENT_METHOD_LABELS[paymentMethod]}. Total: ${
              bookingTotalLabel ?? 'por confirmar'
            }.`
      }
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar"
    />
  );
}
