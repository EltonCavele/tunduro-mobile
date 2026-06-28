import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { NewBookingField } from 'components/booking/new-booking/NewBookingField';
import { NewBookingFooter } from 'components/booking/new-booking/NewBookingFooter';
import { NewBookingPaymentConfirmModal } from 'components/booking/new-booking/NewBookingPaymentConfirmModal';
import { NewBookingPriceHighlight } from 'components/booking/new-booking/NewBookingPriceHighlight';
import {
  NewBookingCourtSheet,
  NewBookingDateSheet,
  NewBookingGuestSheet,
} from 'components/booking/new-booking/NewBookingSheets';
import {
  NewBookingGuestsStep,
  NewBookingPaymentStep,
  NewBookingScheduleStep,
  NewBookingSummaryStep,
} from 'components/booking/new-booking/NewBookingSteps';
import { NewBookingStepHeader } from 'components/booking/new-booking/NewBookingStepHeader';
import {
  BOOKING_STEPS,
  formatBookingTotalValue,
  getBookingTotalForWindow,
  getContinueDisabledForStep,
  getContinueLabelForStep,
  getStepIndex,
  STEP_COPY,
  TOTAL_STEPS,
  translateCheckoutError,
  validateMozPhone,
  type BookingStep,
} from 'components/booking/new-booking/new-booking-flow';
import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useStartBookingCheckoutMutation } from 'hooks/useCreateBookingMutation';
import { useCourtDayBookingsQuery } from 'hooks/useCourtDayBookingsQuery';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useUserSearchQuery } from 'hooks/useUserSearchQuery';
import { useWalletQuery } from 'hooks/useWalletQuery';
import type { UserProfile } from 'lib/auth.types';
import type { BookingPaymentMethod } from 'lib/booking-pricing';
import {
  areSlotsAdjacent,
  buildHourlySlots,
  buildSelectedSlotWindow,
  clampBookableDateKey,
  formatTimeRangeLabel,
  getRemainingDailyMinutes,
  isSlotBlockedByCourt,
  isSlotBlockedByLeadTime,
  isSlotBlockedByOrganizer,
  MAX_DAILY_BOOKING_MINUTES,
  SLOT_DURATION_MINUTES,
} from 'lib/booking-reservation';
import { ApiClientError, getErrorMessage } from 'lib/error-utils';

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
  const walletQuery = useWalletQuery();
  const startBookingCheckoutMutation = useStartBookingCheckoutMutation();
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourtId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedGuests, setSelectedGuests] = useState<UserProfile[]>([]);
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
  const [lightingRequested, setLightingRequested] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('MPESA');
  const [isCourtSheetOpen, setIsCourtSheetOpen] = useState(false);
  const [isGuestSheetOpen, setIsGuestSheetOpen] = useState(false);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [phone, setPhone] = useState(user?.phone?.trim() ?? '');
  const [phoneError, setPhoneError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [bookingStep, setBookingStep] = useState<BookingStep>('court');
  const deferredGuestSearchQuery = useDeferredValue(guestSearchQuery);

  const activeCourts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const myBookings = useMemo(() => myBookingsQuery.data ?? [], [myBookingsQuery.data]);
  const selectedCourt = activeCourts.find((court) => court.id === selectedCourtId) ?? null;
  const canUseLighting = Boolean(
    selectedCourt?.hasLighting && (selectedCourt.lightingDeviceId?.length ?? 1) > 0
  );
  const walletBalance = walletQuery.data?.balance ?? 0;
  const walletCurrency = walletQuery.data?.currency ?? selectedCourt?.currency ?? 'MZN';
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
  const bookingTotalValue = useMemo(
    () => getBookingTotalForWindow(selectedCourt, selectedWindow, user?.role, lightingRequested),
    [lightingRequested, selectedCourt, selectedWindow, user?.role]
  );
  const bookingTotalLabel = useMemo(
    () => formatBookingTotalValue(bookingTotalValue, selectedCourt?.currency),
    [bookingTotalValue, selectedCourt?.currency]
  );
  const hasEnoughWalletBalance =
    paymentMethod !== 'CLUB_BALANCE' ||
    (bookingTotalValue !== null && walletBalance >= bookingTotalValue);
  const isPhoneValid = validateMozPhone(phone);
  const canSubmit =
    Boolean(selectedCourt && selectedWindow && user?.id) &&
    (paymentMethod === 'CLUB_BALANCE' || isPhoneValid) &&
    hasEnoughWalletBalance &&
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
  const canProceedFromPayment =
    paymentMethod === 'CLUB_BALANCE' ? hasEnoughWalletBalance : isPhoneValid;

  const stepCopy = STEP_COPY[bookingStep];
  const currentStepIndex = getStepIndex(bookingStep);
  const continueDisabled = getContinueDisabledForStep(bookingStep, {
    canProceedFromCourt,
    canProceedFromGuests,
    canProceedFromPayment,
    canProceedFromSchedule,
    canSubmit,
  });
  const continueLabel = getContinueLabelForStep({
    bookingStep,
    bookingTotalLabel,
    isStartingCheckout: startBookingCheckoutMutation.isPending,
    paymentMethod,
    selectedGuestsCount: selectedGuests.length,
  });
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
  useEffect(() => {
    if (!canUseLighting && lightingRequested) {
      setLightingRequested(false);
    }
  }, [canUseLighting, lightingRequested]);

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
    if (paymentMethod === 'MPESA' && !isPhoneValid) {
      setPhoneError('Numero M-Pesa invalido. Use um numero Vodacom (82-87).');
      setBookingStep('payment');
      return;
    }
    if (paymentMethod === 'CLUB_BALANCE' && !hasEnoughWalletBalance) {
      setSubmissionError('Saldo do clube insuficiente para esta reserva.');
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
        lightingRequested,
        paymentMethod,
        phone: paymentMethod === 'MPESA' ? phone.trim() : undefined,
        participantUserIds: selectedGuests.map((guest) => guest.id),
        startAt: selectedWindow.startAt,
      });
    } catch (error) {
      const message = translateCheckoutError(error);
      setSubmissionError(message);
      setIsPaymentConfirmOpen(false);
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
      if (paymentMethod === 'CLUB_BALANCE') {
        if (!hasEnoughWalletBalance) {
          setSubmissionError('Saldo do clube insuficiente para esta reserva.');
          return;
        }
        setSubmissionError('');
        setBookingStep('summary');
        return;
      }

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
            lightingRequested={lightingRequested}
            rangeLabel={selectedRangeLabel || undefined}
            role={user?.role}
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

        {bookingStep === 'schedule' ? (
          <NewBookingScheduleStep
            availabilityError={availabilityError}
            canUseLighting={canUseLighting}
            isAvailabilityLoading={isAvailabilityLoading}
            lightingRequested={lightingRequested}
            onOpenDateSheet={() => setIsDateSheetOpen(true)}
            onRetryAvailability={() => {
              void Promise.all([courtDayBookingsQuery.refetch(), myBookingsQuery.refetch()]);
            }}
            onSelectSlot={handleSelectSlot}
            onChangeLightingRequested={setLightingRequested}
            remainingDailyMinutes={remainingDailyMinutes}
            selectableSlots={selectableSlots}
            selectedCourt={selectedCourt}
            selectedDate={selectedDate}
          />
        ) : null}

        {bookingStep === 'guests' ? (
          <NewBookingGuestsStep
            maxGuestSlots={maxGuestSlots}
            onOpenGuestSheet={() => setIsGuestSheetOpen(true)}
            onRemoveGuest={(guestId) => {
              setSelectedGuests((currentGuests) =>
                currentGuests.filter((currentGuest) => currentGuest.id !== guestId)
              );
            }}
            selectedGuests={selectedGuests}
          />
        ) : null}

        {bookingStep === 'payment' ? (
          <NewBookingPaymentStep
            hasEnoughWalletBalance={hasEnoughWalletBalance}
            paymentMethod={paymentMethod}
            phone={phone}
            phoneError={phoneError}
            setPaymentMethod={setPaymentMethod}
            setPhone={setPhone}
            setPhoneError={setPhoneError}
            setSubmissionError={setSubmissionError}
            walletBalance={walletBalance}
            walletCurrency={walletCurrency}
            walletIsLoading={walletQuery.isLoading}
          />
        ) : null}

        {bookingStep === 'summary' ? (
          <NewBookingSummaryStep
            lightingRequested={lightingRequested}
            paymentMethod={paymentMethod}
            phone={phone}
            selectedCourt={selectedCourt}
            selectedDate={selectedDate}
            selectedGuests={selectedGuests}
            selectedRangeLabel={selectedRangeLabel}
            submissionError={submissionError}
            walletBalance={walletBalance}
            walletCurrency={walletCurrency}
          />
        ) : null}

        <View style={{ height: 120 + Math.max(insets.bottom, 20) }} />
      </ScrollView>

      <NewBookingFooter
        disabled={continueDisabled}
        isLoading={bookingStep === 'summary' && startBookingCheckoutMutation.isPending}
        label={continueLabel}
        onPress={() => {
          if (bookingStep === 'summary') {
            setIsPaymentConfirmOpen(true);
            return;
          }

          goToNextStep();
        }}
      />

      <NewBookingPaymentConfirmModal
        bookingTotalLabel={bookingTotalLabel}
        isLoading={startBookingCheckoutMutation.isPending}
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        onConfirm={() => void handleCreateBooking()}
        paymentMethod={paymentMethod}
        phone={phone}
        selectedCourtName={selectedCourt?.name}
        selectedDate={selectedDate}
        selectedRangeLabel={selectedRangeLabel}
      />

      <NewBookingCourtSheet
        activeCourts={activeCourts}
        error={courtsQuery.error}
        isLoading={courtsQuery.isLoading}
        onClose={() => setIsCourtSheetOpen(false)}
        onSelectCourt={(court) => {
          resetSlotSelection();
          setSelectedCourtId(court.id);
          setIsCourtSheetOpen(false);
        }}
        role={user?.role}
        selectedCourtId={selectedCourtId}
        visible={isCourtSheetOpen}
      />

      <NewBookingGuestSheet
        error={guestSearchQueryResult.error}
        guestOptions={guestOptions}
        guestSearchQuery={guestSearchQuery}
        isLoading={guestSearchQueryResult.isLoading}
        maxGuestSlots={maxGuestSlots}
        onChangeGuestSearchQuery={setGuestSearchQuery}
        onClearGuests={() => setSelectedGuests([])}
        onClose={() => setIsGuestSheetOpen(false)}
        onToggleGuest={handleToggleGuest}
        selectedGuests={selectedGuests}
        visible={isGuestSheetOpen}
      />

      <NewBookingDateSheet
        onClose={() => setIsDateSheetOpen(false)}
        onSelectDate={(dateKey) => {
          resetSlotSelection();
          setSelectedDate(dateKey);
          setIsDateSheetOpen(false);
        }}
        selectedDate={selectedDate}
        visible={isDateSheetOpen}
      />
    </SafeAreaView>
  );
}
