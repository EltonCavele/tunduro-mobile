import { Text } from 'components/app/Text';
import { TextInput } from 'components/app/TextInput';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, SearchField } from 'heroui-native';
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  MapPin,
  Phone,
  Trash2,
  Users,
} from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingCourtOptionRow } from 'components/booking/new-booking/NewBookingCourtOptionRow';
import { NewBookingEmptyStateCard } from 'components/booking/new-booking/NewBookingEmptyStateCard';
import { NewBookingField } from 'components/booking/new-booking/NewBookingField';
import { NewBookingFooter } from 'components/booking/new-booking/NewBookingFooter';
import { NewBookingPriceHighlight } from 'components/booking/new-booking/NewBookingPriceHighlight';
import { NewBookingGuestOptionRow } from 'components/booking/new-booking/NewBookingGuestOptionRow';
import { NewBookingInstructionRow } from 'components/booking/new-booking/NewBookingInstructionRow';
import { NewBookingSelectedGuestChip } from 'components/booking/new-booking/NewBookingSelectedGuestChip';
import { NewBookingSheet } from 'components/booking/new-booking/NewBookingSheet';
import { NewBookingStepHeader } from 'components/booking/new-booking/NewBookingStepHeader';
import { NewBookingSummaryCard } from 'components/booking/new-booking/NewBookingSummaryCard';
import { NewBookingTimeSlotRow } from 'components/booking/new-booking/NewBookingTimeSlotRow';
import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import type { UserProfile } from 'lib/auth.types';
import {
  areSlotsAdjacent,
  buildHourlySlots,
  buildSelectedSlotWindow,
  clampBookableDateKey,
  formatReservationDateLabel,
  formatTimeRangeLabel,
  getMaxBookableDateKey,
  getRemainingDailyMinutes,
  isSlotBlockedByCourt,
  isSlotBlockedByLeadTime,
  isSlotBlockedByOrganizer,
  MAX_DAILY_BOOKING_MINUTES,
  SLOT_DURATION_MINUTES,
} from 'lib/booking-reservation';
import { ApiClientError, getErrorMessage } from 'lib/error-utils';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useCourtDayBookingsQuery } from 'hooks/useCourtDayBookingsQuery';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { useStartBookingCheckoutMutation } from 'hooks/useCreateBookingMutation';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useUserSearchQuery } from 'hooks/useUserSearchQuery';
import type { Court } from 'lib/court.types';

const MOZ_MSISDN_REGEX = /^(\+?258)?\s?(8[2-7])\s?\d{3}\s?\d{4}$|^(8[2-7])\d{7}$/;

const BOOKING_STEPS = ['court', 'schedule', 'guests', 'payment', 'summary'] as const;
const TOTAL_STEPS = BOOKING_STEPS.length;

type BookingStep = (typeof BOOKING_STEPS)[number];

const STEP_COPY: Record<
  BookingStep,
  {
    subtitle?: string;
    title: string;
  }
> = {
  court: {
    subtitle: 'Escolhe o campo onde queres jogar.',
    title: 'Qual quadra queres reservar?',
  },
  schedule: {
    subtitle: 'Define a data e o horario da tua partida.',
    title: 'Quando queres jogar?',
  },
  guests: {
    subtitle: 'Convida outros membros do clube ou continua sozinho.',
    title: 'Quem mais vai jogar?',
  },
  payment: {
    subtitle: 'Vais receber um pedido de PIN no telemovel M-Pesa.',
    title: 'Como queres pagar?',
  },
  summary: {
    subtitle: 'Revê tudo antes de confirmar o pagamento.',
    title: 'Confirma a tua reserva',
  },
};

function validateMozPhone(value: string) {
  return MOZ_MSISDN_REGEX.test(value.trim());
}

function translateCheckoutError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 409) {
      return 'Este horario ja nao esta disponivel.';
    }

    if (error.statusCode === 503) {
      return 'Pagamentos temporariamente indisponiveis. Tenta novamente.';
    }

    if (
      error.statusCode === 400 &&
      typeof error.data === 'object' &&
      error.data &&
      'message' in error.data &&
      Reflect.get(error.data, 'message') === 'payment.error.invalidPhone'
    ) {
      return 'Numero M-Pesa invalido. Confere o formato (84xxxxxxx).';
    }
  }

  return getErrorMessage(error, 'Nao foi possivel iniciar o checkout do pagamento.');
}

function getStepIndex(step: BookingStep) {
  return BOOKING_STEPS.indexOf(step) + 1;
}

export function NewBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ courtId?: string; date?: string }>();
  const initialCourtId = typeof params.courtId === 'string' ? params.courtId.trim() : '';
  const initialDate = clampBookableDateKey(
    typeof params.date === 'string' ? params.date : undefined
  );
  const { user } = useAuthStatus();
  const courtsQuery = useCourtsQuery();
  const myBookingsQuery = useMyBookingsQuery();
  const startBookingCheckoutMutation = useStartBookingCheckoutMutation();
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourtId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedGuests, setSelectedGuests] = useState<UserProfile[]>([]);
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
  const [isCourtSheetOpen, setIsCourtSheetOpen] = useState(false);
  const [isGuestSheetOpen, setIsGuestSheetOpen] = useState(false);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [phone, setPhone] = useState(user?.phone?.trim() ?? '');
  const [phoneError, setPhoneError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [bookingStep, setBookingStep] = useState<BookingStep>('court');
  const deferredGuestSearchQuery = useDeferredValue(guestSearchQuery);

  const activeCourts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const myBookings = useMemo(() => myBookingsQuery.data ?? [], [myBookingsQuery.data]);
  const selectedCourt = activeCourts.find((court) => court.id === selectedCourtId) ?? null;
  const maxGuestSlots = selectedCourt ? Math.max(selectedCourt.maxPlayers - 1, 0) : 20;

  const courtDayBookingsQuery = useCourtDayBookingsQuery({
    courtId: selectedCourtId,
    dateKey: selectedDate,
    enabled: Boolean(selectedCourtId),
  });
  const guestSearchQueryResult = useUserSearchQuery(deferredGuestSearchQuery, {
    enabled: isGuestSheetOpen,
  });

  const remainingDailyMinutes = useMemo(() => {
    if (!user?.id) {
      return MAX_DAILY_BOOKING_MINUTES;
    }

    return getRemainingDailyMinutes(myBookings, user.id, selectedDate);
  }, [myBookings, selectedDate, user?.id]);

  const timeSlots = useMemo(() => buildHourlySlots(selectedDate), [selectedDate]);

  const selectableSlots = useMemo<SelectableTimeSlot[]>(() => {
    return timeSlots.map((slot) => {
      const isCourtBlocked = isSlotBlockedByCourt(courtDayBookingsQuery.data ?? [], slot);
      const isOrganizerBlocked = user?.id
        ? isSlotBlockedByOrganizer(myBookings, user.id, slot)
        : false;
      const isLeadTimeBlocked = isSlotBlockedByLeadTime(slot);
      const isDisabled =
        remainingDailyMinutes < SLOT_DURATION_MINUTES ||
        isCourtBlocked ||
        isOrganizerBlocked ||
        isLeadTimeBlocked;

      return {
        ...slot,
        accentColors: ['#EEF3EE', '#EEF3EE'],
        isCourtBlocked,
        isDisabled,
        isLeadTimeBlocked,
        isOrganizerBlocked,
        isSelected: selectedSlotKeys.includes(slot.key),
      };
    });
  }, [
    courtDayBookingsQuery.data,
    myBookings,
    remainingDailyMinutes,
    selectedSlotKeys,
    timeSlots,
    user?.id,
  ]);

  const selectedSlots = useMemo(
    () =>
      selectableSlots
        .filter((slot) => selectedSlotKeys.includes(slot.key))
        .sort((left, right) => left.startAt.localeCompare(right.startAt)),
    [selectableSlots, selectedSlotKeys]
  );
  const selectedWindow = useMemo(() => buildSelectedSlotWindow(selectedSlots), [selectedSlots]);
  const invalidSelectedSlotKeys = useMemo(
    () =>
      selectedSlotKeys.filter(
        (key) => !selectableSlots.some((slot) => slot.key === key && !slot.isDisabled)
      ),
    [selectableSlots, selectedSlotKeys]
  );
  const guestOptions = guestSearchQueryResult.data ?? [];
  const isAvailabilityLoading =
    Boolean(selectedCourtId) && (courtDayBookingsQuery.isLoading || myBookingsQuery.isLoading);
  const availabilityError =
    courtDayBookingsQuery.error && selectedCourtId
      ? getErrorMessage(courtDayBookingsQuery.error, 'Nao foi possivel carregar os horarios.')
      : myBookingsQuery.isError
        ? getErrorMessage(myBookingsQuery.error, 'Nao foi possivel validar o limite diario.')
        : '';
  const selectedRangeLabel = selectedWindow
    ? formatTimeRangeLabel(selectedWindow.startAt, selectedWindow.endAt)
    : '';
  const bookingTotalLabel = useMemo(() => {
    if (!selectedCourt || !selectedWindow) {
      return null;
    }

    const startMs = new Date(selectedWindow.startAt).getTime();
    const endMs = new Date(selectedWindow.endAt).getTime();

    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
      return null;
    }

    const totalHours = (endMs - startMs) / 3600000;
    const totalPrice = selectedCourt.pricePerHour * totalHours;

    try {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: selectedCourt.currency || 'MZN',
        minimumFractionDigits: 2,
      }).format(totalPrice);
    } catch {
      return `${totalPrice.toFixed(2)} ${selectedCourt.currency || 'MZN'}`;
    }
  }, [selectedCourt, selectedWindow]);
  const isPhoneValid = validateMozPhone(phone);
  const canSubmit =
    Boolean(selectedCourt && selectedWindow && user?.id) &&
    isPhoneValid &&
    !startBookingCheckoutMutation.isPending &&
    !isAvailabilityLoading &&
    !courtDayBookingsQuery.isError &&
    !myBookingsQuery.isError &&
    selectedGuests.length <= maxGuestSlots;
  const canProceedFromCourt = Boolean(selectedCourtId);
  const canProceedFromSchedule =
    Boolean(selectedCourt && selectedWindow) &&
    !isAvailabilityLoading &&
    !courtDayBookingsQuery.isError &&
    !myBookingsQuery.isError;
  const canProceedFromGuests = selectedGuests.length <= maxGuestSlots;
  const canProceedFromPayment = isPhoneValid;

  const stepCopy = STEP_COPY[bookingStep];
  const currentStepIndex = getStepIndex(bookingStep);

  useEffect(() => {
    if (!phone.trim() && user?.phone?.trim()) {
      setPhone(user.phone.trim());
    }
  }, [phone, user?.phone]);

  useEffect(() => {
    if (selectedGuests.length <= maxGuestSlots) {
      return;
    }

    setSelectedGuests((currentGuests) => currentGuests.slice(0, maxGuestSlots));
  }, [maxGuestSlots, selectedGuests.length]);

  useEffect(() => {
    if (invalidSelectedSlotKeys.length === 0) {
      return;
    }

    setSelectedSlotKeys((currentKeys) =>
      currentKeys.filter((key) => !invalidSelectedSlotKeys.includes(key))
    );
  }, [invalidSelectedSlotKeys]);

  function resetSlotSelection() {
    if (selectedSlotKeys.length > 0) {
      setSelectedSlotKeys([]);
    }

    if (submissionError) {
      setSubmissionError('');
    }
  }

  function handleSelectSlot(slot: SelectableTimeSlot) {
    if (slot.isDisabled && !slot.isSelected) {
      return;
    }

    setSubmissionError('');
    setSelectedSlotKeys((currentKeys) => {
      if (currentKeys.includes(slot.key)) {
        return currentKeys.filter((key) => key !== slot.key);
      }

      if (currentKeys.length === 0) {
        return [slot.key];
      }

      if (currentKeys.length === 1) {
        const currentSlot = selectableSlots.find((item) => item.key === currentKeys[0]);

        if (!currentSlot) {
          return [slot.key];
        }

        if (
          remainingDailyMinutes >= SLOT_DURATION_MINUTES * 2 &&
          areSlotsAdjacent(currentSlot, slot)
        ) {
          return [currentSlot.key, slot.key].sort((leftKey, rightKey) => {
            const leftSlot = selectableSlots.find((item) => item.key === leftKey);
            const rightSlot = selectableSlots.find((item) => item.key === rightKey);

            return (leftSlot?.startAt ?? '').localeCompare(rightSlot?.startAt ?? '');
          });
        }

        return [slot.key];
      }

      return [slot.key];
    });
  }

  function handleToggleGuest(guest: UserProfile) {
    setSubmissionError('');
    setSelectedGuests((currentGuests) => {
      if (currentGuests.some((currentGuest) => currentGuest.id === guest.id)) {
        return currentGuests.filter((currentGuest) => currentGuest.id !== guest.id);
      }

      if (currentGuests.length >= maxGuestSlots) {
        return currentGuests;
      }

      return [...currentGuests, guest];
    });
  }

  async function handleCreateBooking() {
    if (!isPhoneValid) {
      setPhoneError('Numero M-Pesa invalido. Use um numero Vodacom (82-87).');
      setBookingStep('payment');
      return;
    }

    if (!selectedCourt || !selectedWindow) {
      setSubmissionError('Selecione uma quadra e um horario para continuar.');
      setBookingStep('schedule');
      return;
    }

    if (!user?.id) {
      setSubmissionError('Nao foi possivel identificar o utilizador autenticado.');
      return;
    }

    try {
      setSubmissionError('');
      setPhoneError('');
      await startBookingCheckoutMutation.mutateAsync({
        courtId: selectedCourt.id,
        endAt: selectedWindow.endAt,
        phone: phone.trim(),
        participantUserIds: selectedGuests.map((guest) => guest.id),
        startAt: selectedWindow.startAt,
      });
    } catch (error) {
      const message = translateCheckoutError(error);
      setSubmissionError(message);

      if (error instanceof ApiClientError && error.statusCode === 409) {
        void Promise.all([courtDayBookingsQuery.refetch(), myBookingsQuery.refetch()]);
        setBookingStep('schedule');
      }

      if (message.includes('Numero M-Pesa invalido')) {
        setPhoneError(message);
        setBookingStep('payment');
      }
    }
  }

  function goToNextStep() {
    if (bookingStep === 'court' && canProceedFromCourt) {
      setBookingStep('schedule');
      return;
    }

    if (bookingStep === 'schedule' && canProceedFromSchedule) {
      setBookingStep('guests');
      return;
    }

    if (bookingStep === 'guests' && canProceedFromGuests) {
      setBookingStep('payment');
      return;
    }

    if (bookingStep === 'payment') {
      if (!isPhoneValid) {
        setPhoneError('Numero M-Pesa invalido. Use um numero Vodacom (82-87).');
        return;
      }

      setPhoneError('');
      setBookingStep('summary');
    }
  }

  function goToPreviousStep() {
    if (bookingStep === 'court') {
      router.back();
      return;
    }

    const currentIndex = BOOKING_STEPS.indexOf(bookingStep);

    if (currentIndex > 0) {
      setBookingStep(BOOKING_STEPS[currentIndex - 1]);
    }
  }

  function getContinueDisabled() {
    switch (bookingStep) {
      case 'court':
        return !canProceedFromCourt;
      case 'schedule':
        return !canProceedFromSchedule;
      case 'guests':
        return !canProceedFromGuests;
      case 'payment':
        return !canProceedFromPayment;
      case 'summary':
        return !canSubmit;
      default:
        return true;
    }
  }

  function getContinueLabel() {
    if (bookingStep === 'summary') {
      return startBookingCheckoutMutation.isPending
        ? 'A iniciar pagamento...'
        : bookingTotalLabel
          ? `Pagar ${bookingTotalLabel}`
          : 'Confirmar pagamento';
    }

    if (bookingStep === 'guests' && selectedGuests.length === 0) {
      return 'Continuar sem convidados';
    }

    return 'Continuar';
  }

  function renderScheduleStep() {
    return (
      <>
        <NewBookingField
          label="Data"
          onPress={() => setIsDateSheetOpen(true)}
          placeholder="dd / mm / aaaa"
          required
          value={formatReservationDateLabel(selectedDate)}
        />

        <View className="mb-4">
          <NewBookingInstructionRow
            description={`Ainda podes reservar ${remainingDailyMinutes} min neste dia.`}
            icon={Clock3}
            label="Escolhe um ou dois horarios consecutivos"
            showDivider
          />
          <NewBookingInstructionRow
            description="Cada bloco corresponde a 1 hora de jogo."
            icon={CalendarDays}
            label="Horarios disponiveis"
            showDivider={false}
          />
        </View>

        {!selectedCourt ? (
          <NewBookingEmptyStateCard
            description="Volta ao passo anterior e escolhe uma quadra."
            title="Quadra em falta"
          />
        ) : isAvailabilityLoading ? (
          <View className="items-center rounded-2xl border border-[#ECECEC] bg-white px-5 py-10">
            <LoadingIndicator size="small" />
            <Text className="font-label mt-3 text-center text-[14px] text-[#6D6D6D]">
              A verificar disponibilidade da quadra.
            </Text>
          </View>
        ) : availabilityError ? (
          <View className="rounded-2xl border border-[#F5D6D4] bg-[#FFF8F7] px-5 py-5">
            <Text className="font-title text-[16px] text-[#171717]">
              Nao foi possivel validar os horarios
            </Text>
            <Text className="font-label mt-2 text-[13px] leading-[19px] text-[#7C6F6F]">
              {availabilityError}
            </Text>
            <Button
              className="mt-4 self-start rounded-full bg-[#BDE111] px-4"
              feedbackVariant="none"
              onPress={() => {
                void Promise.all([courtDayBookingsQuery.refetch(), myBookingsQuery.refetch()]);
              }}>
              <Button.Label className="font-button text-[12px] text-white">
                Tentar novamente
              </Button.Label>
            </Button>
          </View>
        ) : remainingDailyMinutes < SLOT_DURATION_MINUTES ? (
          <NewBookingEmptyStateCard
            description="Ja atingiste o limite de 2 horas de reserva para esta data."
            title="Limite diario atingido"
          />
        ) : selectableSlots.every((slot) => slot.isDisabled) ? (
          <NewBookingEmptyStateCard
            description="Nao existem horarios livres para esta quadra na data escolhida."
            title="Sem disponibilidade"
          />
        ) : (
          <View className="rounded-2xl border border-[#ECECEC] bg-white px-4">
            {selectableSlots.map((slot, index) => (
              <NewBookingTimeSlotRow
                key={slot.key}
                onPress={() => handleSelectSlot(slot)}
                showDivider={index < selectableSlots.length - 1}
                slot={slot}
              />
            ))}
          </View>
        )}
      </>
    );
  }

  function renderGuestsStep() {
    return (
      <>
        <NewBookingField
          label="Convidados"
          onPress={() => setIsGuestSheetOpen(true)}
          placeholder="Adicionar membro do clube"
          value={
            selectedGuests.length
              ? `${selectedGuests.length} convidado${selectedGuests.length > 1 ? 's' : ''} selecionado${selectedGuests.length > 1 ? 's' : ''}`
              : undefined
          }
        />

        {selectedGuests.length > 0 ? (
          <View className="mb-4 flex-row flex-wrap">
            {selectedGuests.map((guest) => (
              <NewBookingSelectedGuestChip
                key={guest.id}
                guest={guest}
                onRemove={(guestId) => {
                  setSelectedGuests((currentGuests) =>
                    currentGuests.filter((currentGuest) => currentGuest.id !== guestId)
                  );
                }}
              />
            ))}
          </View>
        ) : null}

        <View className="rounded-2xl border border-[#ECECEC] bg-white px-4">
          <NewBookingInstructionRow
            description={`Podes convidar ate ${maxGuestSlots} jogador${maxGuestSlots === 1 ? '' : 'es'}.`}
            icon={Users}
            label="Convites sao opcionais"
            showDivider
          />
          <NewBookingInstructionRow
            description="Os convidados recebem notificacao quando confirmares a reserva."
            icon={MapPin}
            label="Organizador confirma o jogo"
            showDivider={false}
          />
        </View>
      </>
    );
  }

  function renderPaymentStep() {
    return (
      <View>
        <Text className="font-label mb-2 text-[15px] text-[#202020]">Numero M-Pesa</Text>
        <TextInput
          autoComplete="tel"
          className={`font-input h-[52px] rounded-2xl border bg-white px-4 text-[15px] text-[#171717] ${
            phoneError ? 'border-[#D05B5B]' : 'border-[#D8D8DE]'
          }`}
          keyboardType="phone-pad"
          maxLength={15}
          onChangeText={(value) => {
            setPhone(value);
            if (phoneError) {
              setPhoneError('');
            }
          }}
          placeholder="84 123 4567"
          textContentType="telephoneNumber"
          value={phone}
        />
        {phoneError ? (
          <Text className="font-label mt-2 text-[13px] leading-5 text-[#D05B5B]">{phoneError}</Text>
        ) : null}
        <Text className="font-label mt-3 text-[13px] leading-[20px] text-[#8A8A8A]">
          Vodacom Mocambique. Introduz o numero que vais usar para autorizar o pagamento.
        </Text>

        <View className="mt-6 rounded-2xl border border-[#ECECEC] bg-white px-4">
          <NewBookingInstructionRow
            description="O PIN e pedido apenas no momento do pagamento."
            icon={Phone}
            label="Pagamento seguro via M-Pesa"
            showDivider={false}
          />
        </View>
      </View>
    );
  }

  function renderSummaryStep() {
    return (
      <>
        {selectedCourt && selectedRangeLabel ? (
          <NewBookingSummaryCard
            court={selectedCourt}
            dateKey={selectedDate}
            rangeLabel={selectedRangeLabel}
          />
        ) : (
          <NewBookingEmptyStateCard
            description="Completa os passos anteriores para rever o resumo."
            title="Resumo indisponivel"
          />
        )}

        <View className="mt-4 rounded-2xl border border-[#ECECEC] bg-white px-4">
          <NewBookingInstructionRow
            description={phone.trim() || 'Numero em falta'}
            icon={Phone}
            label="Numero de pagamento"
            showDivider
          />
          <NewBookingInstructionRow
            description={
              selectedGuests.length
                ? `${selectedGuests.length} convidado${selectedGuests.length > 1 ? 's' : ''}`
                : 'Sem convidados'
            }
            icon={Users}
            label="Participantes"
            showDivider={false}
          />
        </View>

        {submissionError ? (
          <Text className="font-label mt-4 text-[13px] leading-5 text-[#D05B5B]">
            {submissionError}
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'top']} className="flex-1 bg-white">
      <StatusBar style="dark" />

      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-6 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-11 w-11 items-center justify-center rounded-full border border-[#D8D8DE] bg-white"
          onPress={goToPreviousStep}>
          <ChevronLeft color="#101010" size={22} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <NewBookingStepHeader
          currentStep={currentStepIndex}
          subtitle={stepCopy.subtitle}
          title={stepCopy.title}
          totalSteps={TOTAL_STEPS}
        />

        {selectedCourt ? (
          <NewBookingPriceHighlight
            court={selectedCourt}
            rangeLabel={selectedRangeLabel || undefined}
            totalLabel={bookingTotalLabel}
          />
        ) : null}

        {bookingStep === 'court' ? (
          <NewBookingField
            label="Quadra"
            onPress={() => setIsCourtSheetOpen(true)}
            placeholder="Seleciona a quadra"
            required
            value={selectedCourt?.name}
          />
        ) : null}

        {bookingStep === 'schedule' ? renderScheduleStep() : null}
        {bookingStep === 'guests' ? renderGuestsStep() : null}
        {bookingStep === 'payment' ? renderPaymentStep() : null}
        {bookingStep === 'summary' ? renderSummaryStep() : null}

        <View style={{ height: 120 + Math.max(insets.bottom, 20) }} />
      </ScrollView>

      <NewBookingFooter
        disabled={getContinueDisabled()}
        isLoading={bookingStep === 'summary' && startBookingCheckoutMutation.isPending}
        label={getContinueLabel()}
        onPress={() => {
          if (bookingStep === 'summary') {
            void handleCreateBooking();
            return;
          }

          goToNextStep();
        }}
      />

      <NewBookingSheet
        onClose={() => setIsCourtSheetOpen(false)}
        title="Selecionar quadra"
        snapPoints={['70%']}
        visible={isCourtSheetOpen}>
        {courtsQuery.isLoading ? (
          <View className="py-10">
            <LoadingIndicator size="small" />
          </View>
        ) : courtsQuery.error ? (
          <NewBookingEmptyStateCard
            description={getErrorMessage(
              courtsQuery.error,
              'Nao foi possivel carregar a lista de quadras.'
            )}
            title="Erro ao carregar quadras"
          />
        ) : (
          <BottomSheetFlatList<Court>
            data={activeCourts}
            keyExtractor={(item: Court) => item.id}
            renderItem={(info: ListRenderItemInfo<Court>) => {
              const { item } = info;

              return (
                <NewBookingCourtOptionRow
                  court={item}
                  isSelected={item.id === selectedCourtId}
                  onPress={() => {
                    resetSlotSelection();
                    setSelectedCourtId(item.id);
                    setIsCourtSheetOpen(false);
                  }}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </NewBookingSheet>

      <NewBookingSheet
        onClose={() => setIsGuestSheetOpen(false)}
        title="Selecionar convidados"
        visible={isGuestSheetOpen}
        snapPoints={['80%']}>
        <SearchField className="mb-4" value={guestSearchQuery} onChange={setGuestSearchQuery}>
          <SearchField.Group className="rounded-[20px] bg-[#F1F2F4]">
            <SearchField.SearchIcon iconProps={{ color: '#71727A', size: 18 }} />
            <SearchField.Input
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Pesquisar membro"
              placeholderColorClassName="text-[#8F9099]"
              variant="secondary"
            />
          </SearchField.Group>
        </SearchField>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Users size={16} stroke="#BDE111" strokeWidth={2.1} />
            <Text className="font-label ml-2 text-[12px] text-[#666666]">
              {selectedGuests.length}/{maxGuestSlots} convidados
            </Text>
          </View>

          {selectedGuests.length > 0 ? (
            <Button feedbackVariant="none" onPress={() => setSelectedGuests([])} variant="ghost">
              <Trash2 size={20} stroke="red" color="red" strokeWidth={2.1} />
            </Button>
          ) : null}
        </View>

        {guestSearchQueryResult.isLoading ? (
          <View className="items-center justify-center py-10">
            <LoadingIndicator size="large" />
            <Text className="font-label mt-3 text-center text-[13px] text-[#6D6D6D]">
              A pesquisar membros.
            </Text>
          </View>
        ) : guestSearchQueryResult.error ? (
          <NewBookingEmptyStateCard
            description={getErrorMessage(
              guestSearchQueryResult.error,
              'Nao foi possivel carregar os membros.'
            )}
            title="Erro ao carregar membros"
          />
        ) : guestOptions.length === 0 ? (
          <NewBookingEmptyStateCard
            description="Nenhum membro encontrado para a pesquisa atual."
            title="Sem resultados"
          />
        ) : (
          <BottomSheetFlatList<UserProfile>
            data={guestOptions}
            keyExtractor={(item: UserProfile) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={(info: ListRenderItemInfo<UserProfile>) => {
              const { item } = info;
              const isSelected = selectedGuests.some((guest) => guest.id === item.id);
              const isDisabled = !isSelected && selectedGuests.length >= maxGuestSlots;

              return (
                <NewBookingGuestOptionRow
                  guest={item}
                  isDisabled={isDisabled}
                  isSelected={isSelected}
                  onPress={() => handleToggleGuest(item)}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </NewBookingSheet>

      <NewBookingSheet
        onClose={() => setIsDateSheetOpen(false)}
        title="Selecionar data"
        visible={isDateSheetOpen}
        snapPoints={['70%']}>
        <View className="mb-4 flex-row items-center">
          <CalendarDays size={18} stroke="#BDE111" strokeWidth={2.1} />
          <Text className="font-label ml-2 text-[12px] text-[#666666]">
            Escolhe uma data ate {formatReservationDateLabel(getMaxBookableDateKey())}
          </Text>
        </View>

        <Calendar
          enableSwipeMonths
          firstDay={1}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#BDE111',
            },
          }}
          maxDate={getMaxBookableDateKey()}
          minDate={clampBookableDateKey()}
          onDayPress={(day) => {
            resetSlotSelection();
            setSelectedDate(clampBookableDateKey(day.dateString));
            setIsDateSheetOpen(false);
          }}
          theme={{
            arrowColor: '#BDE111',
            dayTextColor: '#181818',
            monthTextColor: '#181818',
            selectedDayBackgroundColor: '#BDE111',
            selectedDayTextColor: '#181818',
            textDayFontFamily: 'Poppins_400Regular',
            textMonthFontFamily: 'Poppins_600SemiBold',
            textDayFontSize: 13,
            textMonthFontSize: 16,
            todayTextColor: '#BDE111',
          }}
        />
      </NewBookingSheet>
    </SafeAreaView>
  );
}
