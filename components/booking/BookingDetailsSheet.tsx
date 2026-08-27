import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Clock3, Share2, X } from 'lucide-react-native';
import { Linking, Pressable, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationModal } from 'components/app/ConfirmationModal';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { Text } from 'components/app/Text';
import { BookingDetailsActionBar } from 'components/booking/booking-details/BookingDetailsActionBar';
import {
  CheckInStatusCard,
  InfoCard,
  PersonRow,
  ScreenState,
  StatusPill,
} from 'components/booking/booking-details/BookingDetailsParts';
import {
  buildBookingDetailsViewModel,
  formatCurrencyValue,
  formatExtensionEndLabel,
  getSessionCountdownParts,
  isAcceptedBookingMember,
  isBookingCheckInTime,
  isNearBookingEnd,
  isUserParticipantOnBooking,
  type PendingConfirmationAction,
} from 'components/booking/booking-details/booking-details.helpers';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useBookingDetailsQuery } from 'hooks/useBookingDetailsQuery';
import { useBookingUsersQuery } from 'hooks/useBookingUsersQuery';
import { useCancelBookingMutation } from 'hooks/useCancelBookingMutation';
import { useCheckInBookingMutation } from 'hooks/useCheckInBookingMutation';
import { useCourtQuery } from 'hooks/useCourtQuery';
import { useExtendBookingMutation } from 'hooks/useExtendBookingMutation';
import { useRespondBookingInvitationMutation } from 'hooks/useRespondBookingInvitationMutation';
import type { UserProfile } from 'lib/auth.types';
import { BookingStatus } from 'lib/calendar-bookings';
import { getErrorMessage } from 'lib/error-utils';

interface BookingDetailsSheetProps {
  bookingId: string | null;
  onClose: () => void;
}

export function BookingDetailsSheet({ bookingId, onClose }: BookingDetailsSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const { user } = useAuthStatus();
  const [actionError, setActionError] = useState('');
  const [pendingConfirmationAction, setPendingConfirmationAction] =
    useState<PendingConfirmationAction>(null);
  const [pendingInvitationAction, setPendingInvitationAction] = useState<
    'accept' | 'decline' | null
  >(null);
  const [sessionClockTick, setSessionClockTick] = useState(0);

  const bookingQuery = useBookingDetailsQuery(bookingId || '', {
    enabled: Boolean(bookingId),
  });
  const booking = bookingQuery.data ?? null;
  const courtQuery = useCourtQuery(booking?.courtId, {
    enabled: Boolean(booking?.courtId),
  });
  const cancelBookingMutation = useCancelBookingMutation();
  const checkInBookingMutation = useCheckInBookingMutation();
  const extendBookingMutation = useExtendBookingMutation();
  const respondInvitationMutation = useRespondBookingInvitationMutation();

  useEffect(() => {
    if (!bookingId || !booking || booking.status === BookingStatus.CANCELLED) {
      return;
    }

    const intervalId = setInterval(() => {
      setSessionClockTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [booking, bookingId]);

  const nowMs = Date.now();
  void sessionClockTick;

  const hasBookingStarted = booking ? isBookingCheckInTime(booking.startAt, nowMs) : false;
  const sessionCountdown =
    booking && booking.status !== BookingStatus.CANCELLED
      ? hasBookingStarted
        ? getSessionCountdownParts(booking.endAt, 'toEnd', nowMs)
        : getSessionCountdownParts(booking.startAt, 'toStart', nowMs)
      : null;

  const relatedUserIds = useMemo(() => {
    if (!booking) {
      return [];
    }

    return Array.from(
      new Set(
        [
          booking.organizerId,
          ...(booking.participants?.map((participant) => participant.userId) ?? []),
        ].filter((userId) => userId !== user?.id)
      )
    );
  }, [booking, user?.id]);

  const relatedUsersQuery = useBookingUsersQuery(relatedUserIds, {
    enabled: Boolean(booking),
  });

  const relatedUsers = useMemo(() => {
    const usersMap = new Map<string, UserProfile>();

    if (user?.id) {
      usersMap.set(user.id, user);
    }

    (relatedUsersQuery.data ?? []).forEach((relatedUser) => {
      usersMap.set(relatedUser.id, relatedUser);
    });

    return usersMap;
  }, [relatedUsersQuery.data, user]);

  const bookingDetails = useMemo(
    () =>
      booking
        ? buildBookingDetailsViewModel(booking, user, relatedUsers, courtQuery.data ?? null)
        : null,
    [booking, courtQuery.data, relatedUsers, user]
  );

  const currentPendingParticipant = useMemo(() => {
    if (!booking || !user) {
      return null;
    }

    return (
      (booking.participants ?? []).find(
        (participant) => participant.status === 'INVITED' && participant.userId === user.id
      ) ?? null
    );
  }, [booking, user]);

  const isOrganizer = Boolean(booking && user?.id && booking.organizerId === user.id);
  const canCancelBooking = Boolean(
    isOrganizer &&
    booking &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
  const canRespondToInvitation = Boolean(
    currentPendingParticipant &&
    booking &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
  const canPerformCheckIn = Boolean(
    booking &&
    user?.id &&
    booking.status === BookingStatus.CONFIRMED &&
    !booking.checkedInAt &&
    isUserParticipantOnBooking(booking, user.id)
  );
  const isCheckInTime = hasBookingStarted;
  const canExtendBooking = Boolean(
    booking?.extension?.available &&
    isAcceptedBookingMember(booking, user?.id) &&
    booking.status === BookingStatus.CONFIRMED
  );
  const showExtensionUnavailableHint = Boolean(
    booking &&
    booking.extension &&
    !booking.extension.available &&
    isAcceptedBookingMember(booking, user?.id) &&
    isNearBookingEnd(booking.endAt, nowMs)
  );
  const isAcceptMutationPending =
    pendingInvitationAction === 'accept' && respondInvitationMutation.isPending;
  const isDeclineMutationPending =
    pendingInvitationAction === 'decline' && respondInvitationMutation.isPending;
  const primaryErrorMessage = getErrorMessage(
    bookingQuery.error,
    'Nao foi possivel carregar os detalhes desta reserva.'
  );

  useEffect(() => {
    if (bookingId) {
      const frameId = requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      return () => cancelAnimationFrame(frameId);
    }

    bottomSheetRef.current?.dismiss();
  }, [bookingId]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    []
  );

  function handleDismissSheet() {
    bottomSheetRef.current?.dismiss();
    onClose();
  }

  async function handleExtendBooking() {
    if (!booking) {
      setActionError('Nao foi possivel identificar esta reserva.');
      setPendingConfirmationAction(null);
      return;
    }

    setActionError('');

    try {
      await extendBookingMutation.mutateAsync({
        bookingId: booking.id,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, 'Nao foi possivel prolongar a reserva.'));
    } finally {
      setPendingConfirmationAction(null);
    }
  }

  const confirmationModalConfig =
    pendingConfirmationAction === 'extend-booking'
      ? {
          confirmLabel: extendBookingMutation.isPending
            ? booking?.extension?.amount === 0
              ? 'A confirmar extensao...'
              : 'A iniciar pagamento...'
            : 'Confirmar extensao',
          description: booking?.extension?.available
            ? booking.extension.amount === 0
              ? `A extensao gratuita vai prolongar a reserva ate ${
                  formatExtensionEndLabel(booking.extension.newEndAt) || 'a nova hora'
                }. Benefício de sócio ao fim de semana.`
              : `Vais pagar ${formatCurrencyValue(
                  booking.extension.amount ?? 0,
                  booking.currency
                )} para prolongar a reserva ate ${
                  formatExtensionEndLabel(booking.extension.newEndAt) || 'a nova hora'
                }. Vamos abrir o pagamento para confirmar.`
            : 'A extensao ja nao esta disponivel para esta reserva.',
          isLoading: extendBookingMutation.isPending,
          onConfirm: () => {
            void handleExtendBooking();
          },
          title: 'Prolongar +1 hora',
          tone: 'default' as const,
        }
      : pendingConfirmationAction === 'cancel-booking'
        ? {
            confirmLabel: cancelBookingMutation.isPending
              ? 'A cancelar reserva...'
              : 'Cancelar reserva',
            description: 'Esta acao vai libertar o campo e atualizar o estado da reserva.',
            isLoading: cancelBookingMutation.isPending,
            onConfirm: () => {
              void handleCancelBooking();
            },
            title: 'Cancelar reserva',
            tone: 'danger' as const,
          }
        : pendingConfirmationAction === 'decline-invitation'
          ? {
              confirmLabel: isDeclineMutationPending ? 'A negar convite...' : 'Negar convite',
              description:
                'Se negares este convite, vais sair desta reserva e o convite deixa de estar disponivel.',
              isLoading: isDeclineMutationPending,
              onConfirm: () => {
                void handleRespondToInvitation('decline');
              },
              title: 'Negar convite',
              tone: 'danger' as const,
            }
          : null;

  async function handleShareBooking() {
    if (!bookingDetails) {
      return;
    }

    try {
      await Share.share({
        message: bookingDetails.shareMessage,
        title: bookingDetails.title,
      });
    } catch {
      // Ignore native share cancellation/failure.
    }
  }

  async function handleCallOrganizer() {
    if (!bookingDetails?.organizer.phoneLabel) {
      return;
    }

    const normalizedPhone = bookingDetails.organizer.phoneLabel.replace(/\s+/g, '');
    await Linking.openURL(`tel:${normalizedPhone}`);
  }

  async function handleCancelBooking() {
    if (!bookingId) {
      return;
    }

    try {
      setActionError('');
      await cancelBookingMutation.mutateAsync({
        bookingId,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, 'Nao foi possivel cancelar a reserva.'));
    } finally {
      setPendingConfirmationAction(null);
    }
  }

  async function handleCheckIn() {
    if (!bookingId || !isCheckInTime) {
      return;
    }

    try {
      setActionError('');
      await checkInBookingMutation.mutateAsync(bookingId);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Nao foi possivel fazer check-in.'));
    }
  }

  async function handleRespondToInvitation(action: 'accept' | 'decline') {
    if (!currentPendingParticipant || !bookingId) {
      return;
    }

    try {
      setActionError('');
      setPendingInvitationAction(action);
      await respondInvitationMutation.mutateAsync({
        action,
        bookingId,
      });
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          action === 'accept'
            ? 'Nao foi possivel aceitar o convite.'
            : 'Nao foi possivel negar o convite.'
        )
      );
    } finally {
      setPendingInvitationAction(null);
      setPendingConfirmationAction(null);
    }
  }

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: '#D9D9DD', width: 44 }}
        backgroundStyle={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
        onDismiss={onClose}
        snapPoints={snapPoints}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 16,
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-title text-[18px] text-[#111111]">Detalhes da Reserva</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
              onPress={handleDismissSheet}>
              <X color="#181818" size={20} strokeWidth={2.2} />
            </Pressable>
          </View>

          {bookingQuery.isLoading && !booking ? (
            <ScreenState
              description="A carregar os detalhes da reserva selecionada."
              isLoading
              title="A carregar..."
            />
          ) : bookingQuery.isError || !booking || !bookingDetails ? (
            <ScreenState
              actionLabel="Tentar novamente"
              description={primaryErrorMessage}
              onPress={() => void bookingQuery.refetch()}
              title="Erro ao carregar reserva"
            />
          ) : (
            <>
              <View className="flex-row items-start justify-between pb-4">
                <View className="flex-1">
                  <Text className="text-[17px] text-[#202020]">{bookingDetails.dateLabel}</Text>
                  <Text className="leading-9.5 mt-1 text-[32px] text-[#202020]">
                    {bookingDetails.title}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-full bg-[#F4F4F6]"
                  onPress={() => void handleShareBooking()}>
                  <Share2 size={22} stroke="#202020" strokeWidth={2.1} />
                </Pressable>
              </View>

              <View className="mt-2 flex-row flex-wrap gap-3">
                <StatusPill
                  backgroundColor="#D6ED95"
                  label={bookingDetails.statusLabel}
                  textColor="#31461A"
                />

                {canRespondToInvitation ? (
                  <StatusPill
                    backgroundColor="#FF5E4F"
                    label="Convite pendente"
                    textColor="#FFFFFF"
                  />
                ) : bookingDetails.paymentStateLabel !== 'Pago' ? (
                  <StatusPill
                    backgroundColor="#FFF0CC"
                    label={bookingDetails.paymentStateLabel}
                    textColor="#835600"
                  />
                ) : null}
              </View>

              {booking.checkedInAt ? (
                <CheckInStatusCard
                  checkInAt={booking.checkedInAt}
                  isOrganizer={isOrganizer}
                  isParticipant={isUserParticipantOnBooking(booking, user?.id)}
                />
              ) : null}

              {sessionCountdown ? (
                <View className="mt-3 rounded-[20px] bg-[#F4F6F4] px-4 py-4">
                  <Text className="text-[13px] font-semibold uppercase text-[#6F6F6F]">
                    {sessionCountdown.mode === 'toStart'
                      ? 'Tempo até ao início da reserva'
                      : 'Tempo até ao fim da reserva'}
                  </Text>
                  <Text className="mt-2 text-[34px] font-semibold tabular-nums text-[#171717]">
                    {sessionCountdown.mmss}
                  </Text>
                  {sessionCountdown.ended ? (
                    <Text className="mt-1 text-[14px] text-[#6F6F6F]">
                      {sessionCountdown.mode === 'toStart'
                        ? 'A reserva já começou.'
                        : 'A janela desta reserva terminou.'}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-[14px] text-[#6F6F6F]">
                      {`Faltam cerca de ${sessionCountdown.minutesRoundedUp} minuto${
                        sessionCountdown.minutesRoundedUp === 1 ? '' : 's'
                      } ${sessionCountdown.mode === 'toStart' ? 'para iniciar.' : 'para terminar.'}`}
                    </Text>
                  )}
                </View>
              ) : null}

              <View className="mt-7 flex-row gap-4">
                <InfoCard
                  icon={<Clock3 size={22} stroke="#252525" strokeWidth={2} />}
                  subtitle={bookingDetails.durationLabel}
                  title={bookingDetails.timeLabel}
                />
              </View>

              <View className="mt-10">
                <Text className="text-[18px] text-[#232323]">Organizador</Text>
                <View className="mt-3">
                  <PersonRow
                    item={bookingDetails.organizer}
                    onPressPhone={
                      bookingDetails.organizer.phoneLabel
                        ? () => void handleCallOrganizer()
                        : undefined
                    }
                    showDivider={false}
                  />
                </View>
              </View>

              <View className="mt-8 border-t border-[#ECECEC] pt-6">
                <Text className="text-[18px] text-[#232323]">Participantes</Text>

                {relatedUsersQuery.isLoading ? (
                  <View className="mt-4 flex-row items-center">
                    <LoadingIndicator size="small" />
                    <Text className="ml-3 text-[14px] text-[#7A7A7A]">
                      A carregar participantes...
                    </Text>
                  </View>
                ) : bookingDetails.participants.length === 0 ? (
                  <Text className="mt-4 text-[15px] leading-6 text-[#7A7A7A]">
                    Ainda não existem participantes confirmados para esta reserva.
                  </Text>
                ) : (
                  <View className="mt-3">
                    {bookingDetails.participants.map((participant, index) => (
                      <PersonRow
                        key={participant.id}
                        item={participant}
                        showDivider={index < bookingDetails.participants.length - 1}
                      />
                    ))}
                  </View>
                )}
              </View>

              {courtQuery.isError ? (
                <Text className="mt-8 text-[13px] leading-5 text-[#7E7E7E]">
                  Não foi possível carregar todos os detalhes do campo. A reserva continua visível
                  com os dados essenciais.
                </Text>
              ) : null}

              <BookingDetailsActionBar
                actionError={actionError}
                canCancelBooking={canCancelBooking}
                canExtendBooking={canExtendBooking}
                canPerformCheckIn={canPerformCheckIn}
                canRespondToInvitation={canRespondToInvitation}
                extensionUnavailableReason={booking.extension?.reason}
                isAcceptInvitationPending={isAcceptMutationPending}
                isCancelingBooking={cancelBookingMutation.isPending}
                isCheckingIn={checkInBookingMutation.isPending}
                isCheckInTime={isCheckInTime}
                isDeclineInvitationPending={isDeclineMutationPending}
                isExtendingBooking={extendBookingMutation.isPending}
                isInvitationPending={respondInvitationMutation.isPending}
                onAcceptInvitation={() => void handleRespondToInvitation('accept')}
                onCancelBooking={() => setPendingConfirmationAction('cancel-booking')}
                onCheckIn={() => void handleCheckIn()}
                onDeclineInvitation={() => setPendingConfirmationAction('decline-invitation')}
                onExtendBooking={() => setPendingConfirmationAction('extend-booking')}
                showExtensionUnavailableHint={showExtensionUnavailableHint}
              />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      <ConfirmationModal
        confirmLabel={confirmationModalConfig?.confirmLabel ?? 'Confirmar'}
        description={confirmationModalConfig?.description ?? ''}
        isLoading={confirmationModalConfig?.isLoading ?? false}
        isOpen={Boolean(confirmationModalConfig)}
        onClose={() => setPendingConfirmationAction(null)}
        onConfirm={confirmationModalConfig?.onConfirm ?? (() => undefined)}
        title={confirmationModalConfig?.title ?? ''}
        tone={confirmationModalConfig?.tone ?? 'default'}
      />
    </>
  );
}
