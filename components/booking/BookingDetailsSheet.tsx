import { useMemo, useState, type ReactNode } from 'react';

import { Button } from 'heroui-native';
import { Clock3, Phone, Share2 } from 'lucide-react-native';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationModal } from 'components/app/ConfirmationModal';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingSheet } from 'components/booking/new-booking/NewBookingSheet';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useBookingDetailsQuery } from 'hooks/useBookingDetailsQuery';
import { useBookingUsersQuery } from 'hooks/useBookingUsersQuery';
import { useCancelBookingMutation } from 'hooks/useCancelBookingMutation';
import { useCourtQuery } from 'hooks/useCourtQuery';
import { useRespondBookingInvitationMutation } from 'hooks/useRespondBookingInvitationMutation';
import {
  getBookingStatusLabel,
  type BookingItem,
  BookingStatus,
  deriveCourtLabel,
} from 'lib/calendar-bookings';
import { formatTimeRangeLabel } from 'lib/booking-reservation';
import { formatCourtTypeLabel } from 'lib/court-utils';
import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName, getUserInitials } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

interface BookingPersonViewModel {
  avatarUrl: string | null;
  id: string;
  initials: string;
  label: string;
  metaLabel: string | null;
  phoneLabel: string | null;
  statusLabel: string | null;
}

interface BookingDetailsViewModel {
  dateLabel: string;
  durationLabel: string;
  locationLabel: string;
  locationMetaLabel: string;
  organizer: BookingPersonViewModel;
  participants: BookingPersonViewModel[];
  paymentStateLabel: string;
  shareMessage: string;
  statusLabel: string;
  timeLabel: string;
  title: string;
}

type PendingConfirmationAction = 'cancel-booking' | 'decline-invitation' | null;

function ScreenState({
  actionLabel,
  description,
  isLoading,
  onPress,
  title,
}: {
  actionLabel?: string;
  description: string;
  isLoading?: boolean;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View className="flex-1 items-center justify-center pt-8">
      <View className="w-full max-w-[340px] rounded-[30px] px-6 py-8">
        {isLoading ? <LoadingIndicator size="small" /> : null}
        <Text className={`text-center text-[20px] text-[#171717] ${isLoading ? 'mt-4' : ''}`}>
          {title}
        </Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#717171]">{description}</Text>

        {actionLabel && onPress ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center rounded-full bg-[#1F1F1F] px-5 py-3.5"
            onPress={onPress}>
            <Text className="text-[14px] text-white">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function StatusPill({
  backgroundColor,
  label,
  textColor,
}: {
  backgroundColor: string;
  label: string;
  textColor: string;
}) {
  return (
    <View className="rounded-[12px] px-3 py-2" style={{ backgroundColor }}>
      <Text className="text-[12px]" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

function InfoCard({
  icon,
  subtitle,
  title,
  titleClassName,
}: {
  icon: ReactNode;
  subtitle?: string | null;
  title: string;
  titleClassName?: string;
}) {
  return (
    <View className="w-full flex-1 rounded-lg bg-gray-50 px-4 py-4">
      {icon}
      <Text className={`leading-6.5 mt-5 text-xl text-[#232323] ${titleClassName ?? ''}`}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-[14px] leading-6 text-[#8A8A8A]">{subtitle}</Text>
      ) : null}
    </View>
  );
}

function PersonAvatar({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  if (avatarUrl?.trim()) {
    return <Image className="h-12 w-12 rounded-full" source={{ uri: avatarUrl }} />;
  }

  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-[#DDE8DE]">
      <Text className="text-[14px] text-[#1F3125]">{initials}</Text>
    </View>
  );
}

function PersonRow({
  item,
  onPressPhone,
  showDivider,
}: {
  item: BookingPersonViewModel;
  onPressPhone?: () => void;
  showDivider: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-3 ${showDivider ? 'border-b border-[#ECECEC]' : ''}`}>
      <PersonAvatar avatarUrl={item.avatarUrl} initials={item.initials} />

      <View className="ml-3 flex-1">
        <Text className="text-[17px] text-[#232323]">{item.label}</Text>
        {item.metaLabel ? (
          <Text className="mt-1 text-[14px] text-[#7E7E7E]">{item.metaLabel}</Text>
        ) : null}
      </View>

      {item.statusLabel ? (
        <View className="rounded-full bg-gray-100 px-3 py-1.5">
          <Text className="text-[11px] text-[#4A4A4A]">{item.statusLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function formatCurrencyValue(amount: number, currency: string) {
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

function formatParticipantStatusLabel(status: string, isOrganizer: boolean) {
  if (isOrganizer) {
    return 'Organizador';
  }

  switch (status) {
    case 'ACCEPTED':
      return 'Confirmado';
    case 'INVITED':
      return 'Convidado';
    case 'REMOVED':
      return 'Removido';
    case 'DECLINED':
      return 'Recusado';
    default:
      return status.replace(/_/g, ' ');
  }
}

function formatScreenDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponivel';
  }

  const formatted = new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatPaymentStateLabel(booking: BookingItem) {
  if (booking.paidAmount >= booking.totalPrice) {
    return 'Pago';
  }

  if (booking.status === BookingStatus.CANCELLED) {
    return 'Cancelado';
  }

  return 'Pagamento pendente';
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

function getFallbackUserLabel(userId?: string | null) {
  if (!userId?.trim()) {
    return 'Utilizador';
  }

  return `Utilizador ${userId.slice(-4)}`;
}

function getResolvedUserLabel(user?: UserProfile | null, fallbackUserId?: string | null) {
  if (user) {
    const displayName = getUserDisplayName(user);

    if (displayName !== 'Utilizador') {
      return displayName;
    }

    if (user.email?.trim()) {
      return user.email.trim();
    }

    if (user.phone?.trim()) {
      return user.phone.trim();
    }
  }

  return getFallbackUserLabel(fallbackUserId);
}

function getResolvedUserMeta(user?: UserProfile | null) {
  if (user?.email?.trim()) {
    return user.email.trim();
  }

  if (user?.phone?.trim()) {
    return user.phone.trim();
  }

  return null;
}

function buildBookingDetailsViewModel(
  booking: BookingItem,
  currentUser: UserProfile | null,
  relatedUsers: Map<string, UserProfile>,
  court?: {
    name: string;
    surface: string;
    type: 'INDOOR' | 'OUTDOOR';
  } | null
): BookingDetailsViewModel {
  const organizerUser =
    booking.organizerId === currentUser?.id
      ? currentUser
      : (relatedUsers.get(booking.organizerId) ?? null);
  const resolvedCourtName = court?.name ?? deriveCourtLabel(booking.courtId);
  const participants = booking.participants
    .filter((participant) => !participant.isOrganizer)
    .map((participant) => {
      const relatedUser =
        participant.userId === currentUser?.id
          ? currentUser
          : (relatedUsers.get(participant.userId) ?? null);

      return {
        avatarUrl: relatedUser?.avatarUrl ?? null,
        id: participant.userId,
        initials: getUserInitials(relatedUser),
        label: getResolvedUserLabel(relatedUser, participant.userId),
        metaLabel: getResolvedUserMeta(relatedUser),
        phoneLabel: relatedUser?.phone?.trim() || null,
        statusLabel: formatParticipantStatusLabel(participant.status, participant.isOrganizer),
      };
    });

  return {
    dateLabel: formatScreenDateLabel(booking.startAt),
    durationLabel: `${booking.durationMinutes} min`,
    locationLabel: resolvedCourtName,
    locationMetaLabel: court
      ? `${court.surface} • ${formatCourtTypeLabel(court.type)}`
      : 'Detalhes do campo indisponiveis',
    organizer: {
      avatarUrl: organizerUser?.avatarUrl ?? null,
      id: booking.organizerId,
      initials: getUserInitials(organizerUser),
      label: getResolvedUserLabel(organizerUser, booking.organizerId),
      metaLabel: getResolvedUserMeta(organizerUser),
      phoneLabel: organizerUser?.phone?.trim() || null,
      statusLabel: null,
    },
    participants,
    paymentStateLabel: formatPaymentStateLabel(booking),
    shareMessage: [
      resolvedCourtName,
      formatScreenDateLabel(booking.startAt),
      formatTimeRangeLabel(booking.startAt, booking.endAt),
      formatCurrencyValue(booking.totalPrice, booking.currency),
    ].join('\n'),
    statusLabel: getBookingStatusLabel(booking.status),
    timeLabel: formatTimeRangeLabel(booking.startAt, booking.endAt),
    title: resolvedCourtName,
  };
}

interface BookingDetailsSheetProps {
  bookingId: string | null;
  onClose: () => void;
}

export function BookingDetailsSheet({ bookingId, onClose }: BookingDetailsSheetProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStatus();
  const [actionError, setActionError] = useState('');
  const [pendingConfirmationAction, setPendingConfirmationAction] =
    useState<PendingConfirmationAction>(null);
  const [pendingInvitationAction, setPendingInvitationAction] = useState<
    'accept' | 'decline' | null
  >(null);

  const bookingQuery = useBookingDetailsQuery(bookingId || '', {
    enabled: Boolean(bookingId),
  });
  const booking = bookingQuery.data ?? null;
  const courtQuery = useCourtQuery(booking?.courtId, {
    enabled: Boolean(booking?.courtId),
  });
  const cancelBookingMutation = useCancelBookingMutation();
  const respondInvitationMutation = useRespondBookingInvitationMutation();

  const relatedUserIds = useMemo(() => {
    if (!booking) {
      return [];
    }

    return Array.from(
      new Set(
        [
          booking.organizerId,
          ...booking.participants.map((participant) => participant.userId),
          ...booking.invitations
            .map((invitation) => invitation.invitedUserId)
            .filter((invitedUserId): invitedUserId is string => Boolean(invitedUserId)),
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

  const currentPendingInvitation = useMemo(() => {
    if (!booking || !user) {
      return null;
    }

    return (
      booking.invitations.find(
        (invitation) =>
          invitation.status === 'PENDING' &&
          Boolean(invitation.token?.trim()) &&
          (invitation.invitedUserId === user.id ||
            normalizeEmail(invitation.inviteeEmail) === normalizeEmail(user.email))
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
    currentPendingInvitation &&
    booking &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
  const actionBarVisible = canRespondToInvitation || canCancelBooking;
  const isDeclineMutationPending =
    pendingInvitationAction === 'decline' && respondInvitationMutation.isPending;
  const primaryErrorMessage = getErrorMessage(
    bookingQuery.error,
    'Nao foi possivel carregar os detalhes desta reserva.'
  );

  const confirmationModalConfig =
    pendingConfirmationAction === 'cancel-booking'
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
      // Optional: Close the bottom sheet when successfully cancelled.
      // But preserving the state is also fine because the Details will update Live.
    }
  }

  async function handleRespondToInvitation(action: 'accept' | 'decline') {
    if (!currentPendingInvitation) {
      return;
    }

    try {
      setActionError('');
      setPendingInvitationAction(action);
      await respondInvitationMutation.mutateAsync({
        action,
        bookingId: bookingId as string,
        token: currentPendingInvitation.token,
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
    <NewBookingSheet
      visible={Boolean(bookingId)}
      onClose={onClose}
      snapPoints={['90%']}
      title="Detalhes da Reserva">
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
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: actionBarVisible
                ? 180 + Math.max(insets.bottom, 20)
                : Math.max(insets.bottom, 48),
              paddingTop: 8,
            }}
            showsVerticalScrollIndicator={false}>
            <View className="flex-row items-start justify-between pb-4">
              <View className="flex-1">
                <Text className="text-[17px] text-[#202020]">{bookingDetails.dateLabel}</Text>
                <Text className="mt-1 text-[32px] leading-[38px] text-[#202020]">
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
                Não foi possível carregar todos os detalhes do campo. A reserva continua visível com
                os dados essenciais.
              </Text>
            ) : null}
          </ScrollView>

          {actionBarVisible ? (
            <View
              className="absolute bottom-0 left-0 right-0 bg-white pt-4 shadow-sm"
              style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
              {actionError ? (
                <Text className="mb-3 px-6 text-[13px] leading-5 text-[#C14A3D]">
                  {actionError}
                </Text>
              ) : null}

              {canRespondToInvitation ? (
                <View className="flex-row gap-3 px-6">
                  <Button
                    className="h-14 flex-1 rounded-[20px] border border-[#ECECEC] bg-white"
                    feedbackVariant="none"
                    isDisabled={respondInvitationMutation.isPending}
                    onPress={() => setPendingConfirmationAction('decline-invitation')}
                    variant="secondary">
                    <Button.Label className="text-[14px] text-[#232323]">
                      {pendingInvitationAction === 'decline' && respondInvitationMutation.isPending
                        ? 'A negar...'
                        : 'Negar'}
                    </Button.Label>
                  </Button>

                  <Button
                    className="h-14 flex-1 rounded-[20px] bg-[#1F1F1F]"
                    feedbackVariant="none"
                    isDisabled={respondInvitationMutation.isPending}
                    onPress={() => void handleRespondToInvitation('accept')}>
                    <Button.Label className="text-[14px] text-white">
                      {pendingInvitationAction === 'accept' && respondInvitationMutation.isPending
                        ? 'A aceitar...'
                        : 'Aceitar convite'}
                    </Button.Label>
                  </Button>
                </View>
              ) : canCancelBooking ? (
                <View className="px-6">
                  <Button
                    className="h-14 rounded-[20px] bg-[#FCE8E6]"
                    feedbackVariant="none"
                    isDisabled={cancelBookingMutation.isPending}
                    onPress={() => setPendingConfirmationAction('cancel-booking')}
                    variant="secondary">
                    <Button.Label className="text-[14px] text-[#C54D4D]">
                      {cancelBookingMutation.isPending ? 'A cancelar...' : 'Cancelar reserva'}
                    </Button.Label>
                  </Button>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}

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
    </NewBookingSheet>
  );
}
