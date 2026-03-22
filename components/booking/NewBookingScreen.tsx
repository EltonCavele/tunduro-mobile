import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CalendarDays, Check, ChevronDown, Clock3, Search, Users, X } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  type BookingHourSlot,
  MAX_DAILY_BOOKING_MINUTES,
  SLOT_DURATION_MINUTES,
} from 'lib/booking-reservation';
import { getUserDisplayName } from 'lib/auth-utils';
import type { Court } from 'lib/court.types';
import { getErrorMessage } from 'lib/error-utils';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useCourtDayBookingsQuery } from 'hooks/useCourtDayBookingsQuery';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { useStartBookingCheckoutMutation } from 'hooks/useCreateBookingMutation';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useUserSearchQuery } from 'hooks/useUserSearchQuery';
import type { BookingCheckoutSession } from 'services/booking.service';

const DEFAULT_COURT_IMAGE = require('../../assets/imgs/tennis.jpg');
const SLOT_GRADIENTS = [
  ['#FFE5BE', '#FF6B1A'],
  ['#D6FFD5', '#3C8DFF'],
  ['#FFD6D6', '#FF3F2E'],
  ['#E5E5E5', '#555555'],
] as const;

interface BookingFieldProps {
  label: string;
  onPress: () => void;
  placeholder: string;
  required?: boolean;
  value?: string;
}

interface BookingSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
}

interface SelectableTimeSlot extends BookingHourSlot {
  accentColors: readonly [string, string];
  isCourtBlocked: boolean;
  isDisabled: boolean;
  isLeadTimeBlocked: boolean;
  isOrganizerBlocked: boolean;
  isSelected: boolean;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <View className="mb-3 flex-row items-center">
      <Text className="text-[16px] font-medium text-[#181818]">{label}</Text>
      {required ? <Text className="ml-1 text-[18px] text-[#FF4B4B]">*</Text> : null}
    </View>
  );
}

function BookingField({ label, onPress, placeholder, required, value }: BookingFieldProps) {
  const hasValue = Boolean(value?.trim());

  return (
    <View className="mb-7">
      <FieldLabel label={label} required={required} />

      <Pressable
        accessibilityRole="button"
        className="h-[56px] flex-row items-center justify-between rounded-[22px] bg-[#E9E9EC] px-5"
        onPress={onPress}>
        <Text className={`text-[16px] ${hasValue ? 'text-[#181818]' : 'text-[#92939C]'}`}>
          {hasValue ? value : placeholder}
        </Text>

        <ChevronDown size={24} stroke="#7E8089" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function BookingSheet({ children, onClose, title, visible }: BookingSheetProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="max-h-[85%] rounded-t-[28px] bg-white px-6 pb-8 pt-4">
            <View className="mb-5 items-center">
              <View className="h-1.5 w-14 rounded-full bg-[#D9D9DD]" />
            </View>

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[20px] font-semibold text-[#111111]">{title}</Text>

              <Pressable
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
                onPress={onClose}>
                <X size={20} stroke="#181818" strokeWidth={2.3} />
              </Pressable>
            </View>

            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function EmptyStateCard({ description, title }: { description: string; title: string }) {
  return (
    <View className="rounded-[24px] bg-[#F7F7F8] px-5 py-6">
      <Text className="text-[16px] font-semibold text-[#161616]">{title}</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#767676]">{description}</Text>
    </View>
  );
}

function SelectedGuestChip({
  guest,
  onRemove,
}: {
  guest: UserProfile;
  onRemove: (guestId: string) => void;
}) {
  return (
    <View className="mr-2 mt-2 flex-row items-center rounded-full bg-[#EEF3ED] px-3 py-2">
      <Text className="text-[13px] font-medium text-[#1F3125]">{getUserDisplayName(guest)}</Text>

      <Pressable accessibilityRole="button" className="ml-2" onPress={() => onRemove(guest.id)}>
        <X size={14} stroke="#1F3125" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function CourtOptionRow({
  court,
  isSelected,
  onPress,
}: {
  court: Court;
  isSelected: boolean;
  onPress: () => void;
}) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: court.images[0].url }
    : DEFAULT_COURT_IMAGE;

  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[24px] border px-4 py-4 ${
        isSelected ? 'border-[#1F3125] bg-[#EEF3ED]' : 'border-[#ECECEF] bg-white'
      }`}
      onPress={onPress}>
      <Image className="h-16 w-16 rounded-[18px]" resizeMode="cover" source={imageSource} />

      <View className="ml-4 flex-1">
        <Text className="text-[16px] font-semibold text-[#171717]">{court.name}</Text>
        <Text className="mt-1 text-[13px] text-[#757575]">
          {court.surface} • {court.type === 'INDOOR' ? 'Indoor' : 'Outdoor'}
        </Text>
        <Text className="mt-1 text-[12px] text-[#8A8A8A]">
          {court.pricePerHour} {court.currency}/hora • {court.maxPlayers} jogadores
        </Text>
      </View>

      {isSelected ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1F3125]">
          <Check size={16} stroke="#FFFFFF" strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}

function GuestOptionRow({
  guest,
  isDisabled,
  isSelected,
  onPress,
}: {
  guest: UserProfile;
  isDisabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[22px] px-4 py-4 ${
        isSelected ? 'bg-[#EEF3ED]' : 'bg-[#F7F7F8]'
      } ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      onPress={onPress}>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#DCE9DD]">
        <Text className="text-[14px] font-semibold text-[#1F3125]">
          {getUserDisplayName(guest).slice(0, 1).toUpperCase()}
        </Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-medium text-[#171717]">{getUserDisplayName(guest)}</Text>
        <Text className="mt-1 text-[12px] text-[#7A7A7A]">{guest.email}</Text>
      </View>

      <View
        className={`h-6 w-6 items-center justify-center rounded-full border ${
          isSelected ? 'border-[#1F3125] bg-[#1F3125]' : 'border-[#C7CAD1] bg-white'
        }`}>
        {isSelected ? <Check size={14} stroke="#FFFFFF" strokeWidth={2.3} /> : null}
      </View>
    </Pressable>
  );
}

function TimeSlotRow({ onPress, slot }: { onPress: () => void; slot: SelectableTimeSlot }) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[24px] px-4 py-4 ${
        slot.isSelected ? 'bg-[#E9E9EC]' : 'bg-white'
      } ${slot.isDisabled && !slot.isSelected ? 'opacity-50' : ''}`}
      disabled={slot.isDisabled && !slot.isSelected}
      onPress={onPress}>
      <LinearGradient
        className="h-12 w-12 rounded-full"
        colors={slot.accentColors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
      />

      <View className="ml-4 flex-1">
        <Text className="text-[17px] font-medium text-[#191919]">{slot.label}</Text>

        {slot.isCourtBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">Ja reservado nesta quadra</Text>
        ) : null}

        {!slot.isCourtBlocked && slot.isOrganizerBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">Conflito com outra reserva tua</Text>
        ) : null}

        {!slot.isCourtBlocked && !slot.isOrganizerBlocked && slot.isLeadTimeBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">
            Disponivel apenas com 30 minutos de antecedencia
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function BookingSummaryCard({
  court,
  dateKey,
  organizerName,
  rangeLabel,
}: {
  court: Court;
  dateKey: string;
  organizerName: string;
  rangeLabel: string;
}) {
  const imageSource: ImageSourcePropType = court.images[0]?.url
    ? { uri: court.images[0].url }
    : DEFAULT_COURT_IMAGE;

  return (
    <View className="rounded-[28px] bg-[#F1F1F3] px-5 py-5">
      <View className="flex-row">
        <Image className="h-24 w-24 rounded-[24px]" resizeMode="cover" source={imageSource} />

        <View className="ml-4 flex-1 justify-center">
          <Text className="text-[20px] font-semibold text-[#171717]">{court.name}</Text>
          <Text className="mt-1 text-[15px] text-[#5A5A5A]">{rangeLabel}</Text>
          <Text className="mt-1 text-[13px] text-[#878787]">
            {formatReservationDateLabel(dateKey)}
          </Text>
          <Text className="mt-3 text-[15px] font-medium text-[#1B1B1B]">{organizerName}</Text>
        </View>
      </View>
    </View>
  );
}

export function NewBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate = clampBookableDateKey(
    typeof params.date === 'string' ? params.date : undefined
  );
  const { user } = useAuthStatus();
  const courtsQuery = useCourtsQuery();
  const myBookingsQuery = useMyBookingsQuery();
  const startBookingCheckoutMutation = useStartBookingCheckoutMutation();
  const [selectedCourtId, setSelectedCourtId] = useState('');
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-6 py-5">
        <Pressable
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <X size={34} stroke="#121212" strokeWidth={2.2} />
        </Pressable>

        <Text className="text-[24px] font-semibold text-[#111111]">Nova Reserva</Text>

        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <BookingField
          label="Quadra"
          onPress={() => setIsCourtSheetOpen(true)}
          placeholder="Selecione a quadra"
          required
          value={selectedCourt?.name}
        />

        <BookingField
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
              <SelectedGuestChip
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

        <BookingField
          label="Data"
          onPress={() => setIsDateSheetOpen(true)}
          placeholder="dd / mm / yyyy"
          required
          value={formatReservationDateLabel(selectedDate)}
        />

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[18px] font-semibold text-[#181818]">Horarios disponiveis</Text>
          <View className="flex-row items-center rounded-full bg-[#F3F4F2] px-3 py-2">
            <Clock3 size={15} stroke="#1F3125" strokeWidth={2.1} />
            <Text className="ml-2 text-[12px] font-medium text-[#1F3125]">
              Restante: {remainingDailyMinutes} min
            </Text>
          </View>
        </View>

        {!selectedCourt ? (
          <EmptyStateCard
            description="Escolhe primeiro uma quadra para ver os horarios livres nessa data."
            title="Quadra em falta"
          />
        ) : isAvailabilityLoading ? (
          <View className="rounded-[24px] bg-[#F7F7F8] px-5 py-8">
            <ActivityIndicator color="#1F3125" size="small" />
            <Text className="mt-3 text-center text-[14px] text-[#6D6D6D]">
              A verificar disponibilidade da quadra.
            </Text>
          </View>
        ) : availabilityError ? (
          <View className="rounded-[24px] bg-[#FFF4F4] px-5 py-6">
            <Text className="text-[16px] font-semibold text-[#171717]">
              Nao foi possivel validar os horarios
            </Text>
            <Text className="mt-2 text-[13px] leading-5 text-[#7C6F6F]">{availabilityError}</Text>

            <Pressable
              accessibilityRole="button"
              className="mt-4 self-start rounded-full bg-[#1F3125] px-4 py-2"
              onPress={() => {
                void Promise.all([courtDayBookingsQuery.refetch(), myBookingsQuery.refetch()]);
              }}>
              <Text className="text-[13px] font-semibold text-white">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : remainingDailyMinutes < SLOT_DURATION_MINUTES ? (
          <EmptyStateCard
            description="Ja atingiste o limite de 2 horas de reserva para esta data."
            title="Limite diario atingido"
          />
        ) : selectableSlots.every((slot) => slot.isDisabled) ? (
          <EmptyStateCard
            description="Nao existem horarios livres para esta quadra na data escolhida."
            title="Sem disponibilidade"
          />
        ) : (
          <View>
            {selectableSlots.map((slot) => (
              <TimeSlotRow key={slot.key} onPress={() => handleSelectSlot(slot)} slot={slot} />
            ))}
          </View>
        )}

        <View style={{ height: 220 + Math.max(insets.bottom, 20) }} />
      </ScrollView>

      <View
        className="border-t border-[#F0F0F0] bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {selectedCourt && selectedRangeLabel ? (
          <BookingSummaryCard
            court={selectedCourt}
            dateKey={selectedDate}
            organizerName={organizerName}
            rangeLabel={selectedRangeLabel}
          />
        ) : (
          <View className="rounded-[24px] bg-[#F7F7F8] px-5 py-5">
            <Text className="text-[15px] font-medium text-[#181818]">
              Seleciona a quadra, a data e um horario para concluir a reserva.
            </Text>
          </View>
        )}

        {submissionError ? (
          <Text className="mt-3 text-[13px] leading-5 text-[#D05B5B]">{submissionError}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          className={`mt-4 h-[58px] items-center justify-center rounded-full ${
            canSubmit ? 'bg-[#1F3125]' : 'bg-[#C9CDC8]'
          }`}
          disabled={!canSubmit}
          onPress={() => void handleCreateBooking()}>
          <Text className="text-[18px] font-semibold text-white">
            {startBookingCheckoutMutation.isPending
              ? 'A iniciar pagamento...'
              : canReuseCheckoutSession
                ? 'Continuar pagamento'
                : 'Pagar e reservar'}
          </Text>
        </Pressable>
      </View>

      <BookingSheet
        onClose={() => setIsCourtSheetOpen(false)}
        title="Selecionar quadra"
        visible={isCourtSheetOpen}>
        {courtsQuery.isLoading ? (
          <View className="py-10">
            <ActivityIndicator color="#1F3125" size="small" />
          </View>
        ) : courtsQuery.error ? (
          <EmptyStateCard
            description={getErrorMessage(
              courtsQuery.error,
              'Nao foi possivel carregar a lista de quadras.'
            )}
            title="Erro ao carregar quadras"
          />
        ) : (
          <FlatList
            data={activeCourts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CourtOptionRow
                court={item}
                isSelected={item.id === selectedCourtId}
                onPress={() => {
                  resetSelectionState();
                  setSelectedCourtId(item.id);
                  setIsCourtSheetOpen(false);
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BookingSheet>

      <BookingSheet
        onClose={() => setIsGuestSheetOpen(false)}
        title="Selecionar convidados"
        visible={isGuestSheetOpen}>
        <View className="mb-4 flex-row items-center rounded-[20px] bg-[#F1F2F4] px-4">
          <Search size={18} stroke="#71727A" strokeWidth={2.1} />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="ml-3 h-12 flex-1 text-[15px] text-[#111111]"
            onChangeText={setGuestSearchQuery}
            placeholder="Pesquisar membro"
            placeholderTextColor="#8F9099"
            value={guestSearchQuery}
          />
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Users size={16} stroke="#1F3125" strokeWidth={2.1} />
            <Text className="ml-2 text-[13px] text-[#666666]">
              {selectedGuests.length}/{maxGuestSlots} convidados
            </Text>
          </View>

          {selectedGuests.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => setSelectedGuests([])}>
              <Text className="text-[13px] font-medium text-[#1F3125]">Limpar</Text>
            </Pressable>
          ) : null}
        </View>

        {guestSearchQueryResult.isLoading ? (
          <View className="py-10">
            <ActivityIndicator color="#1F3125" size="small" />
          </View>
        ) : guestSearchQueryResult.error ? (
          <EmptyStateCard
            description={getErrorMessage(
              guestSearchQueryResult.error,
              'Nao foi possivel carregar os membros.'
            )}
            title="Erro ao carregar membros"
          />
        ) : guestOptions.length === 0 ? (
          <EmptyStateCard
            description="Nenhum membro encontrado para a pesquisa atual."
            title="Sem resultados"
          />
        ) : (
          <FlatList
            data={guestOptions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selectedGuests.some((guest) => guest.id === item.id);
              const isDisabled = !isSelected && selectedGuests.length >= maxGuestSlots;

              return (
                <GuestOptionRow
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
      </BookingSheet>

      <BookingSheet
        onClose={() => setIsDateSheetOpen(false)}
        title="Selecionar data"
        visible={isDateSheetOpen}>
        <View className="mb-4 flex-row items-center">
          <CalendarDays size={18} stroke="#1F3125" strokeWidth={2.1} />
          <Text className="ml-2 text-[13px] text-[#666666]">
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
            textDayFontSize: 14,
            textMonthFontSize: 18,
            todayTextColor: '#1F3125',
          }}
        />
      </BookingSheet>
    </SafeAreaView>
  );
}
