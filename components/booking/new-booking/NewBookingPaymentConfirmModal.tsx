import { ConfirmationModal } from 'components/app/ConfirmationModal';
import type { BookingPaymentMethod } from 'lib/booking-pricing';
import { formatReservationDateLabel } from 'lib/booking-reservation';

type NewBookingPaymentConfirmModalProps = {
  bookingTotalLabel: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: BookingPaymentMethod;
  phone: string;
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
  phone,
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
            ? 'Sim, usar saldo'
            : bookingTotalLabel
              ? `Sim, pagar ${bookingTotalLabel}`
              : 'Sim, pagar'
      }
      description={
        paymentMethod === 'CLUB_BALANCE'
          ? `Vamos confirmar a reserva usando o saldo do clube${
              bookingTotalLabel ? ` (${bookingTotalLabel})` : ''
            } pela ${selectedCourtName ?? 'quadra'}, ${formatReservationDateLabel(
              selectedDate
            )}${selectedRangeLabel ? `, das ${selectedRangeLabel}` : ''}.`
          : `Vamos enviar um pedido de PIN do M-Pesa para o número ${phone.trim()}.${
              bookingTotalLabel ? ` Vais pagar ${bookingTotalLabel}` : ''
            } pela ${selectedCourtName ?? 'quadra'}, ${formatReservationDateLabel(
              selectedDate
            )}${selectedRangeLabel ? `, das ${selectedRangeLabel}` : ''}.`
      }
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar pagamento"
    />
  );
}
