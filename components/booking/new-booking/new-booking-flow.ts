import { ApiClientError, getErrorMessage } from 'lib/error-utils';
import type { Role } from 'lib/auth.types';
import { getBookingTotalPrice, type BookingPaymentMethod } from 'lib/booking-pricing';
import type { Court } from 'lib/court.types';

export const BOOKING_STEPS = [
  'court',
  'date',
  'time',
  'lighting',
  'guests',
  'payment',
  'summary',
] as const;
export const TOTAL_STEPS = BOOKING_STEPS.length;

export type BookingStep = (typeof BOOKING_STEPS)[number];

export const STEP_COPY: Record<
  BookingStep,
  {
    subtitle?: string;
    title: string;
  }
> = {
  court: {
    title: 'Escolha o campo',
  },
  date: {
    title: 'Escolha a data',
  },
  time: {
    title: 'Escolha a hora',
  },
  lighting: {
    title: 'Quer iluminacao?',
  },
  guests: {
    title: 'Vai jogar com alguém?',
  },
  payment: {
    title: 'Como vai pagar?',
  },
  summary: {
    title: 'Confirme a reserva',
  },
};

export function translateCheckoutError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 409) {
      return 'Este horario ja nao esta disponivel.';
    }

    if (error.statusCode === 503) {
      return 'Pagamentos temporariamente indisponiveis. Tenta novamente.';
    }

    if (error.statusCode === 402) {
      return 'Saldo do clube insuficiente para esta reserva.';
    }

    if (
      error.statusCode === 400 &&
      typeof error.data === 'object' &&
      error.data &&
      'message' in error.data &&
      Reflect.get(error.data, 'message') === 'payment.error.invalidPhone'
    ) {
      return 'Numero invalido. Confere o formato (84xxxxxxx).';
    }
  }

  return getErrorMessage(error, 'Nao foi possivel iniciar o checkout do pagamento.');
}

export function getStepIndex(step: BookingStep) {
  return BOOKING_STEPS.indexOf(step) + 1;
}

export function getBookingTotalForWindow(
  selectedCourt: Court | null,
  selectedWindow: { startAt: string; endAt: string } | null,
  role: Role | undefined,
  lightingRequested: boolean
) {
  if (!selectedCourt || !selectedWindow) {
    return null;
  }

  const startMs = new Date(selectedWindow.startAt).getTime();
  const endMs = new Date(selectedWindow.endAt).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return null;
  }

  const totalHours = (endMs - startMs) / 3600000;
  return getBookingTotalPrice(selectedCourt, role, totalHours, lightingRequested);
}

export function formatBookingTotalValue(amount: number | null, currency?: string) {
  if (amount === null) {
    return null;
  }

  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency || 'MZN',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'MZN'}`;
  }
}

export function getContinueDisabledForStep(
  step: BookingStep,
  values: {
    canProceedFromCourt: boolean;
    canProceedFromDate: boolean;
    canProceedFromGuests: boolean;
    canProceedFromLighting: boolean;
    canProceedFromPayment: boolean;
    canProceedFromTime: boolean;
    canSubmit: boolean;
  }
) {
  switch (step) {
    case 'court':
      return !values.canProceedFromCourt;
    case 'date':
      return !values.canProceedFromDate;
    case 'time':
      return !values.canProceedFromTime;
    case 'lighting':
      return !values.canProceedFromLighting;
    case 'guests':
      return !values.canProceedFromGuests;
    case 'payment':
      return !values.canProceedFromPayment;
    case 'summary':
      return !values.canSubmit;
    default:
      return true;
  }
}

export function getContinueLabelForStep(args: {
  bookingStep: BookingStep;
  bookingTotalLabel: string | null;
  isStartingCheckout: boolean;
  paymentMethod: BookingPaymentMethod;
  selectedGuestsCount: number;
}) {
  if (args.bookingStep === 'summary') {
    return args.isStartingCheckout
      ? 'A iniciar pagamento...'
      : args.paymentMethod === 'CLUB_BALANCE' && args.bookingTotalLabel
        ? `Reservar com saldo ${args.bookingTotalLabel}`
        : args.bookingTotalLabel
          ? `Pagar ${args.bookingTotalLabel}`
          : 'Confirmar pagamento';
  }

  if (args.bookingStep === 'guests' && args.selectedGuestsCount === 0) {
    return 'Jogar sozinho';
  }

  return 'Continuar';
}
