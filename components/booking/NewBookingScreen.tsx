import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, SearchField } from 'heroui-native';
import { CalendarDays, Clock3, Users } from 'lucide-react-native';
import {
  Linking,
  type ListRenderItemInfo,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingCourtOptionRow } from 'components/booking/new-booking/NewBookingCourtOptionRow';
import { NewBookingEmptyStateCard } from 'components/booking/new-booking/NewBookingEmptyStateCard';
import { NewBookingField } from 'components/booking/new-booking/NewBookingField';
import { NewBookingGuestOptionRow } from 'components/booking/new-booking/NewBookingGuestOptionRow';
import { NewBookingSelectedGuestChip } from 'components/booking/new-booking/NewBookingSelectedGuestChip';
import { NewBookingSheet } from 'components/booking/new-booking/NewBookingSheet';
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
import { getUserDisplayName } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useCourtDayBookingsQuery } from 'hooks/useCourtDayBookingsQuery';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { useStartBookingCheckoutMutation } from 'hooks/useCreateBookingMutation';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useUserSearchQuery } from 'hooks/useUserSearchQuery';
import type { BookingCheckoutSession } from 'services/booking.service';
import type { Court } from 'lib/court.types';

const SLOT_GRADIENTS = [
  ['#FFE5BE', '#FF6B1A'],
  ['#D6FFD5', '#3C8DFF'],
  ['#FFD6D6', '#FF3F2E'],
  ['#E5E5E5', '#555555'],
] as const;

export function NewBookingScreen() {
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
  const [currentCheckoutSession, setCurrentCheckoutSession] =
    useState<BookingCheckoutSession | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const deferredGuestSearchQuery = useDeferredValue(guestSearchQuery);

  const activeCourts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const myBookings = useMemo(() => myBookingsQuery.data ?? [], [myBookingsQuery.data]);
  const selectedCourt = activeCourts.find((court) => court.id === selectedCourtId) ?? null;
  const organizerName = getUserDisplayName(user);
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
    return timeSlots.map((slot, index) => {
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
        accentColors: SLOT_GRADIENTS[index % SLOT_GRADIENTS.length],
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
  const canSubmit =
    Boolean(selectedCourt && selectedWindow && user?.id) &&
    !startBookingCheckoutMutation.isPending &&
    !isAvailabilityLoading &&
    !courtDayBookingsQuery.isError &&
    !myBookingsQuery.isError &&
    selectedGuests.length <= maxGuestSlots;
  const canReuseCheckoutSession = Boolean(
    currentCheckoutSession?.checkoutUrl &&
    ['OPEN', 'FINALIZING'].includes(currentCheckoutSession.status)
  );

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

  function handleSelectSlot(slot: SelectableTimeSlot) {
    if (slot.isDisabled && !slot.isSelected) {
      return;
    }

    setSubmissionError('');
    if (currentCheckoutSession) {
      setCurrentCheckoutSession(null);
    }
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
    if (currentCheckoutSession) {
      setCurrentCheckoutSession(null);
    }
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
    if (canReuseCheckoutSession && currentCheckoutSession?.checkoutUrl) {
      try {
        setSubmissionError('');
        await Linking.openURL(currentCheckoutSession.checkoutUrl);
      } catch (error) {
        setSubmissionError(
          getErrorMessage(error, 'Nao foi possivel abrir novamente o checkout do pagamento.')
        );
      }
      return;
    }

    if (!selectedCourt || !selectedWindow) {
      setSubmissionError('Selecione uma quadra e um horario para continuar.');
      return;
    }

    if (!user?.id) {
      setSubmissionError('Nao foi possivel identificar o utilizador autenticado.');
      return;
    }

    try {
      setSubmissionError('');
      const checkoutSession = await startBookingCheckoutMutation.mutateAsync({
        courtId: selectedCourt.id,
        endAt: selectedWindow.endAt,
        participantUserIds: selectedGuests.map((guest) => guest.id),
        startAt: selectedWindow.startAt,
      });
      setCurrentCheckoutSession(checkoutSession);

      if (!checkoutSession.checkoutUrl) {
        setSubmissionError('O checkout de pagamento nao devolveu um link valido.');
        return;
      }

      await Linking.openURL(checkoutSession.checkoutUrl);
    } catch (error) {
      setSubmissionError(
        getErrorMessage(error, 'Nao foi possivel iniciar o checkout do pagamento.')
      );
    }
  }

  function resetSelectionState() {
    if (selectedSlotKeys.length > 0) {
      setSelectedSlotKeys([]);
    }

    if (submissionError) {
      setSubmissionError('');
    }

    if (currentCheckoutSession) {
      setCurrentCheckoutSession(null);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />

      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: 'Nova Reserva',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <NewBookingField
          label="Quadra"
          onPress={() => setIsCourtSheetOpen(true)}
          placeholder="Selecione a quadra"
          required
          value={selectedCourt?.name}
        />

        <NewBookingField
          label="Convidado(s)"
          onPress={() => setIsGuestSheetOpen(true)}
          placeholder="Adicione um membro"
          value={
            selectedGuests.length
              ? `${selectedGuests.length} convidado${selectedGuests.length > 1 ? 's' : ''}`
              : undefined
          }
        />

        {selectedGuests.length > 0 ? (
          <View className="-mt-4 mb-7 flex-row flex-wrap">
            {selectedGuests.map((guest) => (
              <NewBookingSelectedGuestChip
                key={guest.id}
                guest={guest}
                onRemove={(guestId) => {
                  resetSelectionState();
                  setSelectedGuests((currentGuests) =>
                    currentGuests.filter((currentGuest) => currentGuest.id !== guestId)
                  );
                }}
              />
            ))}
          </View>
        ) : null}

        <NewBookingField
          label="Data"
          onPress={() => setIsDateSheetOpen(true)}
          placeholder="dd / mm / yyyy"
          required
          value={formatReservationDateLabel(selectedDate)}
        />

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[16px] font-semibold text-[#181818]">Horarios disponiveis</Text>
          <View className="flex-row items-center rounded-full bg-[#F3F4F2] px-3 py-2">
            <Clock3 size={15} stroke="#1F3125" strokeWidth={2.1} />
            <Text className="ml-2 text-[11px] font-medium text-[#1F3125]">
              Restante: {remainingDailyMinutes} min
            </Text>
          </View>
        </View>

        {!selectedCourt ? (
          <NewBookingEmptyStateCard
            description="Escolhe primeiro uma quadra para ver os horarios livres nessa data."
            title="Quadra em falta"
          />
        ) : isAvailabilityLoading ? (
          <View className="rounded-3xl bg-[#F7F7F8] px-5 py-8">
            <LoadingIndicator size="small" />
            <Text className="mt-3 text-center text-[13px] text-[#6D6D6D]">
              A verificar disponibilidade da quadra.
            </Text>
          </View>
        ) : availabilityError ? (
          <View className="rounded-3xl bg-[#FFF4F4] px-5 py-6">
            <Text className="text-[15px] font-semibold text-[#171717]">
              Nao foi possivel validar os horarios
            </Text>
            <Text className="leading-4.75 mt-2 text-[12px] text-[#7C6F6F]">
              {availabilityError}
            </Text>

            <Button
              className="mt-4 self-start rounded-full bg-[#1F3125] px-4"
              feedbackVariant="none"
              onPress={() => {
                void Promise.all([courtDayBookingsQuery.refetch(), myBookingsQuery.refetch()]);
              }}>
              <Button.Label className="text-[12px] text-white">Tentar novamente</Button.Label>
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
          <View>
            {selectableSlots.map((slot) => (
              <NewBookingTimeSlotRow
                key={slot.key}
                onPress={() => handleSelectSlot(slot)}
                slot={slot}
              />
            ))}
          </View>
        )}

        <View style={{ height: 220 + Math.max(insets.bottom, 20) }} />
      </ScrollView>

      <View
        className="border-t border-[#F0F0F0] bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {selectedCourt && selectedRangeLabel ? (
          <NewBookingSummaryCard
            court={selectedCourt}
            dateKey={selectedDate}
            organizerName={organizerName}
            rangeLabel={selectedRangeLabel}
          />
        ) : (
          <View className="rounded-[24px] bg-[#F7F7F8] px-5 py-5">
            <Text className="text-[14px] font-medium text-[#181818]">
              Seleciona a quadra, a data e um horario para concluir a reserva.
            </Text>
          </View>
        )}

        {submissionError ? (
          <Text className="mt-3 text-[12px] leading-[19px] text-[#D05B5B]">{submissionError}</Text>
        ) : null}

        <Button
          className={`mt-4 h-[58px] rounded-full ${canSubmit ? 'bg-[#1F3125]' : 'bg-[#C9CDC8]'}`}
          feedbackVariant="none"
          isDisabled={!canSubmit}
          onPress={() => void handleCreateBooking()}>
          <Button.Label className="text-[16px] text-white">
            {startBookingCheckoutMutation.isPending
              ? 'A iniciar pagamento...'
              : canReuseCheckoutSession
                ? 'Continuar pagamento'
                : 'Pagar e reservar'}
          </Button.Label>
        </Button>
      </View>

      <NewBookingSheet
        onClose={() => setIsCourtSheetOpen(false)}
        title="Selecionar quadra"
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
                    resetSelectionState();
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
        visible={isGuestSheetOpen}>
        <SearchField className="mb-4" value={guestSearchQuery} onChange={setGuestSearchQuery}>
          <SearchField.Group className="rounded-[20px] bg-[#F1F2F4]">
            <SearchField.SearchIcon iconProps={{ color: '#71727A', size: 18 }} />
            <SearchField.Input
              autoCapitalize="none"
              autoCorrect={false}
              className="h-12 flex-1 bg-transparent px-4 pl-11 pr-11 text-[14px] text-[#111111]"
              placeholder="Pesquisar membro"
              placeholderColorClassName="text-[#8F9099]"
            />
            <SearchField.ClearButton
              className="absolute right-2 top-1/2 -translate-y-1/2"
              feedbackVariant="none"
              iconProps={{ color: '#71727A', size: 14 }}
              variant="tertiary"
            />
          </SearchField.Group>
        </SearchField>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Users size={16} stroke="#1F3125" strokeWidth={2.1} />
            <Text className="ml-2 text-[12px] text-[#666666]">
              {selectedGuests.length}/{maxGuestSlots} convidados
            </Text>
          </View>

          {selectedGuests.length > 0 ? (
            <Button
              className="min-h-0 px-0"
              feedbackVariant="none"
              onPress={() => setSelectedGuests([])}
              variant="tertiary">
              <Button.Label className="text-[12px] text-[#1F3125]">Limpar</Button.Label>
            </Button>
          ) : null}
        </View>

        {guestSearchQueryResult.isLoading ? (
          <View className="py-10">
            <LoadingIndicator size="small" />
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
        visible={isDateSheetOpen}>
        <View className="mb-4 flex-row items-center">
          <CalendarDays size={18} stroke="#1F3125" strokeWidth={2.1} />
          <Text className="ml-2 text-[12px] text-[#666666]">
            Escolhe uma data ate {formatReservationDateLabel(getMaxBookableDateKey())}
          </Text>
        </View>

        <Calendar
          enableSwipeMonths
          firstDay={1}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#1F3125',
            },
          }}
          maxDate={getMaxBookableDateKey()}
          minDate={clampBookableDateKey()}
          onDayPress={(day) => {
            resetSelectionState();
            setSelectedDate(clampBookableDateKey(day.dateString));
            setIsDateSheetOpen(false);
          }}
          theme={{
            arrowColor: '#1F3125',
            dayTextColor: '#181818',
            monthTextColor: '#181818',
            selectedDayBackgroundColor: '#1F3125',
            selectedDayTextColor: '#FFFFFF',
            textDayFontSize: 13,
            textMonthFontSize: 16,
            todayTextColor: '#1F3125',
          }}
        />
      </NewBookingSheet>
    </SafeAreaView>
  );
}
