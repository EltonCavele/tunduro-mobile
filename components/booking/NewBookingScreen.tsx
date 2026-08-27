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
  NewBookingDateStep,
  NewBookingGuestsStep,
  NewBookingLightingStep,
  NewBookingPaymentStep,
  NewBookingSummaryStep,
  NewBookingTimeStep,
} from 'components/booking/new-booking/NewBookingSteps';
import { NewBookingStepHeader } from 'components/booking/new-booking/NewBookingStepHeader';
import {
  BOOKING_STEPS,
  FREE_BOOKING_STEPS,
  formatBookingTotalValue,
  getBookingTotalForWindow,
  getContinueDisabledForStep,
  getContinueLabelForStep,
  STEP_COPY,
  translateCheckoutError,
  type BookingStep,
} from 'components/booking/new-booking/new-booking-flow';
import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useStartBookingCheckoutMutation } from 'hooks/useCreateBookingMutation';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useNewBookingAvailability } from 'hooks/useNewBookingAvailability';
import {
  useDeleteUserContactMutation,
  useInviteUserContactMutation,
} from 'hooks/useUserContactMutations';
import { useUserContactsQuery } from 'hooks/useUserContactsQuery';
import { useWalletQuery } from 'hooks/useWalletQuery';
import { isMemberWeekendFreeBooking, type BookingPaymentMethod } from 'lib/booking-pricing';
import {
  areSlotsAdjacent,
  buildClubIso,
  buildSelectedSlotWindow,
  clampBookableDateKey,
  formatTimeRangeLabel,
  getBookingDurationMinutes,
  getRemainingDailyMinutes,
  MAX_DAILY_BOOKING_MINUTES,
  SLOT_DURATION_MINUTES,
} from 'lib/booking-reservation';
import { ApiClientError, getErrorMessage } from 'lib/error-utils';
import type { UserContact } from 'services/user.service';

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
  const inviteUserContactMutation = useInviteUserContactMutation();
  const deleteUserContactMutation = useDeleteUserContactMutation();
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourtId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedGuests, setSelectedGuests] = useState<UserContact[]>([]);
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
  const [lightingRequested, setLightingRequested] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('MPESA');
  const [isCourtSheetOpen, setIsCourtSheetOpen] = useState(false);
  const [isGuestSheetOpen, setIsGuestSheetOpen] = useState(false);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [bookingStep, setBookingStep] = useState<BookingStep>('date');
  const deferredGuestSearchQuery = useDeferredValue(guestSearchQuery);

  const activeCourts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const myBookings = useMemo(() => myBookingsQuery.data ?? [], [myBookingsQuery.data]);
  const selectedCourt = activeCourts.find((court) => court.id === selectedCourtId) ?? null;
  const canUseLighting = Boolean(
    selectedCourt?.hasLighting && (selectedCourt.lightingDeviceId?.length ?? 0) > 0
  );
  const walletBalance = walletQuery.data?.balance ?? 0;
  const walletCurrency = walletQuery.data?.currency ?? selectedCourt?.currency ?? 'MZN';
  const maxGuestSlots = selectedCourt ? Math.max(selectedCourt.maxPlayers - 1, 0) : 20;

  const guestSearchQueryResult = useUserContactsQuery(deferredGuestSearchQuery, {
    enabled: isGuestSheetOpen,
  });
  const remainingDailyMinutes = useMemo(() => {
    if (!user?.id) {
      return MAX_DAILY_BOOKING_MINUTES;
    }
    return getRemainingDailyMinutes(myBookings, user.id, selectedDate);
  }, [myBookings, selectedDate, user?.id]);
  const bookingAvailability = useNewBookingAvailability({
    courtId: selectedCourtId,
    dateKey: selectedDate,
    myBookings,
    organizerId: user?.id,
    remainingDailyMinutes,
    selectedSlotKeys,
  });
  const selectableSlots = bookingAvailability.selectableSlots;
  const selectedSlots = useMemo(
    () =>
      selectableSlots
        .filter((slot) => selectedSlotKeys.includes(slot.key))
        .sort((left, right) => left.startAt.localeCompare(right.startAt)),
    [selectableSlots, selectedSlotKeys]
  );
  const selectedWindow = useMemo(() => buildSelectedSlotWindow(selectedSlots), [selectedSlots]);
  // Duration is always derived automatically from the selected window (never entered by hand).
  const bookingDurationMinutes = useMemo(
    () =>
      selectedWindow
        ? getBookingDurationMinutes(selectedWindow.startAt, selectedWindow.endAt)
        : null,
    [selectedWindow]
  );
  const hasValidWindow = bookingDurationMinutes !== null;
  const isAvailabilityLoading =
    bookingAvailability.isLoading || (Boolean(selectedCourtId) && myBookingsQuery.isLoading);
  const availabilityError = bookingAvailability.errorMessage;
  const selectedRangeLabel = selectedWindow
    ? formatTimeRangeLabel(selectedWindow.startAt, selectedWindow.endAt)
    : '';
  const selectedDateStartAt = buildClubIso(selectedDate, 12);
  const bookingTotalValue = useMemo(
    () => getBookingTotalForWindow(selectedCourt, selectedWindow, user?.role, lightingRequested),
    [lightingRequested, selectedCourt, selectedWindow, user?.role]
  );
  const bookingTotalLabel = useMemo(
    () => formatBookingTotalValue(bookingTotalValue, selectedCourt?.currency),
    [bookingTotalValue, selectedCourt?.currency]
  );
  const isFreeBooking = Boolean(
    selectedCourt && isMemberWeekendFreeBooking(selectedCourt, user?.role, selectedDateStartAt)
  );
  const visibleBookingSteps: readonly BookingStep[] = isFreeBooking
    ? FREE_BOOKING_STEPS
    : BOOKING_STEPS;
  const hasEnoughWalletBalance =
    isFreeBooking ||
    paymentMethod !== 'CLUB_BALANCE' ||
    (bookingTotalValue !== null && walletBalance >= bookingTotalValue);
  const canSubmit =
    Boolean(selectedCourt && selectedWindow && user?.id) &&
    hasValidWindow &&
    hasEnoughWalletBalance &&
    !startBookingCheckoutMutation.isPending &&
    !isAvailabilityLoading &&
    !bookingAvailability.isError &&
    selectedGuests.length <= maxGuestSlots;
  const canProceedFromDate = Boolean(selectedDate);
  const canProceedFromTime =
    Boolean(selectedCourt && selectedWindow) &&
    hasValidWindow &&
    !isAvailabilityLoading &&
    !bookingAvailability.isError;
  const canProceedFromLighting = Boolean(selectedCourt) && (!lightingRequested || canUseLighting);

  const continueDisabled = getContinueDisabledForStep(bookingStep, {
    canProceedFromCourt: Boolean(selectedCourt),
    canProceedFromDate,
    canProceedFromGuests: selectedGuests.length <= maxGuestSlots,
    canProceedFromLighting,
    canProceedFromPayment: paymentMethod === 'CLUB_BALANCE' ? hasEnoughWalletBalance : true,
    canProceedFromTime,
    canSubmit,
  });
  const continueLabel = getContinueLabelForStep({
    bookingStep,
    bookingTotalLabel,
    isStartingCheckout: startBookingCheckoutMutation.isPending,
    isFreeBooking,
    paymentMethod,
    selectedGuestsCount: selectedGuests.length,
  });

  useEffect(() => {
    if (selectedGuests.length <= maxGuestSlots) {
      return;
    }
    setSelectedGuests((currentGuests) => currentGuests.slice(0, maxGuestSlots));
  }, [maxGuestSlots, selectedGuests.length]);
  useEffect(() => {
    if (bookingAvailability.invalidSelectedSlotKeys.length === 0) {
      return;
    }
    setSelectedSlotKeys((currentKeys) =>
      currentKeys.filter((key) => !bookingAvailability.invalidSelectedSlotKeys.includes(key))
    );
  }, [bookingAvailability.invalidSelectedSlotKeys]);
  useEffect(() => {
    if (!canUseLighting && lightingRequested) {
      setLightingRequested(false);
    }
  }, [canUseLighting, lightingRequested]);
  useEffect(() => {
    if (isFreeBooking && bookingStep === 'payment') {
      setBookingStep('summary');
    }
  }, [bookingStep, isFreeBooking]);

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

  function handleToggleGuest(guest: UserContact) {
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

  async function handleAddGuestEmail(email: string) {
    try {
      setSubmissionError('');
      const contact = await inviteUserContactMutation.mutateAsync({ email });
      setSelectedGuests((currentGuests) => {
        if (currentGuests.some((guest) => guest.id === contact.id)) {
          return currentGuests;
        }
        if (currentGuests.length >= maxGuestSlots) {
          return currentGuests;
        }
        return [...currentGuests, contact];
      });
      setGuestSearchQuery('');
    } catch (error) {
      setSubmissionError(getErrorMessage(error, 'Nao foi possivel adicionar o contacto.'));
    }
  }

  async function handleDeleteGuestContact(contactId: string) {
    try {
      setSubmissionError('');
      setSelectedGuests((currentGuests) =>
        currentGuests.filter((currentGuest) => currentGuest.id !== contactId)
      );
      await deleteUserContactMutation.mutateAsync(contactId);
    } catch (error) {
      setSubmissionError(getErrorMessage(error, 'Nao foi possivel apagar o contacto.'));
    }
  }

  async function handleCreateBooking() {
    if (!isFreeBooking && paymentMethod === 'CLUB_BALANCE' && !hasEnoughWalletBalance) {
      setSubmissionError('Saldo do clube insuficiente para esta reserva.');
      setBookingStep('payment');
      return;
    }
    if (!selectedCourt || !selectedWindow) {
      setSubmissionError('Selecione uma quadra e um horario para continuar.');
      setBookingStep('time');
      return;
    }
    const durationMinutes = getBookingDurationMinutes(selectedWindow.startAt, selectedWindow.endAt);
    if (durationMinutes === null) {
      setSubmissionError(
        'O horário escolhido é inválido. A hora de fim tem de ser depois da de início.'
      );
      setIsPaymentConfirmOpen(false);
      setBookingStep('time');
      return;
    }
    if (!user?.id) {
      setSubmissionError('Nao foi possivel identificar o utilizador autenticado.');
      return;
    }
    try {
      setSubmissionError('');
      await startBookingCheckoutMutation.mutateAsync({
        courtId: selectedCourt.id,
        endAt: selectedWindow.endAt,
        inviteEmails: selectedGuests
          .filter((guest) => !guest.linkedUserId)
          .map((guest) => guest.email),
        lightingRequested,
        paymentMethod: isFreeBooking ? undefined : paymentMethod,
        participantUserIds: selectedGuests
          .map((guest) => guest.linkedUserId)
          .filter(Boolean) as string[],
        startAt: selectedWindow.startAt,
      });
    } catch (error) {
      const message = translateCheckoutError(error);
      setSubmissionError(message);
      setIsPaymentConfirmOpen(false);
      if (error instanceof ApiClientError && error.statusCode === 409) {
        void Promise.all([bookingAvailability.refetch(), myBookingsQuery.refetch()]);
        setBookingStep('time');
      }
    }
  }

  function goToNextStep() {
    if (bookingStep === 'date' && canProceedFromDate) {
      setBookingStep('court');
      return;
    }
    if (bookingStep === 'court' && selectedCourt) {
      setBookingStep('time');
      return;
    }
    if (bookingStep === 'time' && canProceedFromTime) {
      setBookingStep('lighting');
      return;
    }
    if (bookingStep === 'lighting' && canProceedFromLighting) {
      setBookingStep('guests');
      return;
    }
    if (bookingStep === 'guests' && selectedGuests.length <= maxGuestSlots) {
      setBookingStep(isFreeBooking ? 'summary' : 'payment');
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

      setBookingStep('summary');
    }
  }

  function goToPreviousStep() {
    if (bookingStep === 'date') {
      router.back();
      return;
    }
    const currentIndex = visibleBookingSteps.indexOf(bookingStep);
    if (currentIndex > 0) {
      setBookingStep(visibleBookingSteps[currentIndex - 1]);
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
          currentStep={visibleBookingSteps.indexOf(bookingStep) + 1}
          title={STEP_COPY[bookingStep].title}
          totalSteps={visibleBookingSteps.length}
        />

        {selectedCourt ? (
          <NewBookingPriceHighlight
            court={selectedCourt}
            lightingRequested={lightingRequested}
            rangeLabel={selectedRangeLabel || undefined}
            role={user?.role}
            startAt={selectedDateStartAt}
            totalLabel={bookingTotalLabel}
          />
        ) : null}

        {bookingStep === 'court' ? (
          <NewBookingField
            label="Campo"
            onPress={() => setIsCourtSheetOpen(true)}
            placeholder="Seleciona o campo"
            required
            value={selectedCourt?.name}
          />
        ) : null}

        {bookingStep === 'date' ? (
          <NewBookingDateStep
            onOpenDateSheet={() => setIsDateSheetOpen(true)}
            selectedDate={selectedDate}
          />
        ) : null}

        {bookingStep === 'time' ? (
          <NewBookingTimeStep
            availabilityError={availabilityError}
            isAvailabilityLoading={isAvailabilityLoading}
            onRetryAvailability={() => {
              void Promise.all([bookingAvailability.refetch(), myBookingsQuery.refetch()]);
            }}
            onSelectSlot={handleSelectSlot}
            remainingDailyMinutes={remainingDailyMinutes}
            selectableSlots={selectableSlots}
            selectedCourt={selectedCourt}
          />
        ) : null}

        {bookingStep === 'lighting' ? (
          <NewBookingLightingStep
            canUseLighting={canUseLighting}
            isFreeBooking={isFreeBooking}
            lightingRequested={lightingRequested}
            onChangeLightingRequested={setLightingRequested}
            selectedCourt={selectedCourt}
          />
        ) : null}

        {bookingStep === 'guests' ? (
          <NewBookingGuestsStep
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
            setPaymentMethod={setPaymentMethod}
            setSubmissionError={setSubmissionError}
            walletBalance={walletBalance}
            walletCurrency={walletCurrency}
            walletIsLoading={walletQuery.isLoading}
          />
        ) : null}

        {bookingStep === 'summary' ? (
          <NewBookingSummaryStep
            isFreeBooking={isFreeBooking}
            lightingRequested={lightingRequested}
            paymentMethod={paymentMethod}
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
        loadingLabel={isFreeBooking ? 'A confirmar reserva...' : 'A iniciar pagamento...'}
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
        isFreeBooking={isFreeBooking}
        isLoading={startBookingCheckoutMutation.isPending}
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        onConfirm={() => void handleCreateBooking()}
        paymentMethod={paymentMethod}
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
        startAt={selectedDateStartAt}
        visible={isCourtSheetOpen}
      />

      <NewBookingGuestSheet
        error={guestSearchQueryResult.error}
        guestOptions={guestSearchQueryResult.data ?? []}
        guestSearchQuery={guestSearchQuery}
        isCreatingContact={inviteUserContactMutation.isPending}
        isLoading={guestSearchQueryResult.isLoading}
        maxGuestSlots={maxGuestSlots}
        onAddGuestEmail={(email) => void handleAddGuestEmail(email)}
        onChangeGuestSearchQuery={setGuestSearchQuery}
        onClearGuests={() => setSelectedGuests([])}
        onClose={() => setIsGuestSheetOpen(false)}
        onDeleteContact={(contactId) => void handleDeleteGuestContact(contactId)}
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
