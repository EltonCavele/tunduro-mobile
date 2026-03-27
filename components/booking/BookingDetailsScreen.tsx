import { useMemo, useState, type ReactNode } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CalendarDays, Clock3, CreditCard, Users } from 'lucide-react-native';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useBookingDetailsQuery } from 'hooks/useBookingDetailsQuery';
import { useBookingUsersQuery } from 'hooks/useBookingUsersQuery';
import { useCancelBookingMutation } from 'hooks/useCancelBookingMutation';
import { useCourtQuery } from 'hooks/useCourtQuery';
import {
  getBookingStatusLabel,
  getReservationColor,
  type BookingItem,
  BookingStatus,
  deriveCourtLabel,
} from 'lib/calendar-bookings';
import {
  formatReservationDateLabel,
  formatTimeRangeLabel,
  getClubDateKey,
} from 'lib/booking-reservation';
import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName, getUserInitials } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

const DEFAULT_COURT_IMAGE = require('../../assets/imgs/tennis.jpg');

interface BookingPersonViewModel {
  id: string;
  initials: string;
  label: string;
  metaLabel: string | null;
  stateLabel: string;
}

interface BookingInvitationViewModel {
  id: string;
  label: string;
  metaLabel: string | null;
  stateLabel: string;
}

interface BookingPaymentViewModel {
  amountLabel: string;
  id: string;
  processedAtLabel: string | null;
  stateLabel: string;
  title: string;
}

interface BookingHistoryViewModel {
  id: string;
  reasonLabel: string;
  timestampLabel: string;
  transitionLabel: string;
}

interface BookingDetailsViewModel {
  balanceLabel: string;
  courtImageSource: ImageSourcePropType;
  courtMetaLabel: string;
  courtName: string;
  dateLabel: string;
  durationLabel: string;
  checkedInLabel: string | null;
  invitations: BookingInvitationViewModel[];
  organizer: BookingPersonViewModel;
  participants: BookingPersonViewModel[];
  paymentDueLabel: string | null;
  paymentStateLabel: string;
  payments: BookingPaymentViewModel[];
  statusColor: string;
  statusHistory: BookingHistoryViewModel[];
  statusLabel: string;
  timeLabel: string;
  totalPriceLabel: string;
  paidAmountLabel: string;
}

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
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-full max-w-[340px] rounded-[30px] bg-[#F6F7F5] px-6 py-8">
        {isLoading ? <ActivityIndicator color="#1F3125" size="small" /> : null}
        <Text
          className={`text-center text-[20px] font-semibold text-[#171717] ${isLoading ? 'mt-4' : ''}`}>
          {title}
        </Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#717171]">{description}</Text>

        {actionLabel && onPress ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 items-center rounded-full bg-[#1F3125] px-5 py-3.5"
            onPress={onPress}>
            <Text className="text-[14px] font-semibold text-white">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function SectionCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View className="mb-5 rounded-[28px] bg-[#F7F7F8] px-5 py-5">
      <Text className="text-[18px] font-semibold text-[#171717]">{title}</Text>
      <View className="mt-4">{children}</View>
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[22px] bg-white/80 px-4 py-4">
      <Text className="text-[12px] uppercase tracking-[0.4px] text-[#7D7D7D]">{label}</Text>
      <Text className="mt-2 text-[16px] font-semibold text-[#181818]">{value}</Text>
    </View>
  );
}

function StatusBadge({ accentColor, label }: { accentColor: string; label: string }) {
  return (
    <View
      className="self-start rounded-full px-3 py-1.5"
      style={{
        backgroundColor: `${accentColor}22`,
      }}>
      <Text
        className="text-[11px] font-bold uppercase"
        style={{
          color: accentColor,
        }}>
        {label}
      </Text>
    </View>
  );
}

function PersonRow({ item, showDivider }: { item: BookingPersonViewModel; showDivider: boolean }) {
  return (
    <View className={`${showDivider ? 'border-b border-[#E7E7E9]' : ''} py-3.5`}>
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#DDE8DE]">
          <Text className="text-[14px] font-semibold text-[#1F3125]">{item.initials}</Text>
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-semibold text-[#181818]">{item.label}</Text>
          {item.metaLabel ? (
            <Text className="mt-1 text-[12px] text-[#7A7A7A]">{item.metaLabel}</Text>
          ) : null}
        </View>

        <View className="rounded-full bg-white px-3 py-1.5">
          <Text className="text-[11px] font-medium text-[#1F3125]">{item.stateLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function InvitationRow({
  item,
  showDivider,
}: {
  item: BookingInvitationViewModel;
  showDivider: boolean;
}) {
  return (
    <View className={`${showDivider ? 'border-b border-[#E7E7E9]' : ''} py-3.5`}>
      <Text className="text-[15px] font-semibold text-[#181818]">{item.label}</Text>
      {item.metaLabel ? (
        <Text className="mt-1 text-[12px] text-[#7A7A7A]">{item.metaLabel}</Text>
      ) : null}
      <Text className="mt-2 text-[12px] font-medium text-[#1F3125]">{item.stateLabel}</Text>
    </View>
  );
}

function PaymentRow({
  item,
  showDivider,
}: {
  item: BookingPaymentViewModel;
  showDivider: boolean;
}) {
  return (
    <View className={`${showDivider ? 'border-b border-[#E7E7E9]' : ''} py-3.5`}>
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-[15px] font-semibold text-[#181818]">{item.title}</Text>
        <Text className="ml-4 text-[14px] font-semibold text-[#181818]">{item.amountLabel}</Text>
      </View>
      <Text className="mt-1 text-[12px] text-[#7A7A7A]">{item.stateLabel}</Text>
      {item.processedAtLabel ? (
        <Text className="mt-1 text-[12px] text-[#8D8D8D]">{item.processedAtLabel}</Text>
      ) : null}
    </View>
  );
}

function HistoryRow({
  item,
  showDivider,
}: {
  item: BookingHistoryViewModel;
  showDivider: boolean;
}) {
  return (
    <View className={`${showDivider ? 'border-b border-[#E7E7E9]' : ''} py-3.5`}>
      <Text className="text-[15px] font-semibold text-[#181818]">{item.transitionLabel}</Text>
      <Text className="mt-1 text-[12px] text-[#7A7A7A]">{item.reasonLabel}</Text>
      <Text className="mt-1 text-[12px] text-[#8D8D8D]">{item.timestampLabel}</Text>
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

function formatDateTimeValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data invalida';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatPaymentTypeLabel(type: string) {
  switch (type) {
    case 'BOOKING':
      return 'Pagamento da reserva';
    case 'CANCELLATION_REFUND':
      return 'Reembolso de cancelamento';
    case 'CANCELLATION_PENALTY':
      return 'Penalidade de cancelamento';
    case 'RESCHEDULE_FEE':
      return 'Taxa de reagendamento';
    case 'RESCHEDULE_DIFFERENCE':
      return 'Diferenca de reagendamento';
    case 'WAITLIST_CLAIM':
      return 'Reivindicacao da lista de espera';
    default:
      return type.replace(/_/g, ' ');
  }
}

function formatPaymentStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pagamento pendente';
    case 'COMPLETED':
      return 'Pagamento concluido';
    case 'FAILED':
      return 'Pagamento falhou';
    case 'CANCELLED':
      return 'Pagamento cancelado';
    case 'REFUNDED':
      return 'Pagamento reembolsado';
    default:
      return status.replace(/_/g, ' ');
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

function formatInvitationStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Convite pendente';
    case 'ACCEPTED':
      return 'Convite aceite';
    case 'DECLINED':
      return 'Convite recusado';
    case 'REVOKED':
      return 'Convite revogado';
    case 'EXPIRED':
      return 'Convite expirado';
    default:
      return status.replace(/_/g, ' ');
  }
}

function formatHistoryReason(reason?: string | null) {
  if (!reason?.trim()) {
    return 'Sem detalhes adicionais.';
  }

  return reason.replace(/_/g, ' ');
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
    currency: string;
    images: { url: string }[];
    name: string;
    surface: string;
    type: string;
  } | null
): BookingDetailsViewModel {
  const bookingDateKey = getClubDateKey(booking.startAt);
  const organizerUser =
    booking.organizerId === currentUser?.id
      ? currentUser
      : (relatedUsers.get(booking.organizerId) ?? null);
  const resolvedCourtName = court?.name ?? deriveCourtLabel(booking.courtId);
  const paymentStateLabel =
    booking.paidAmount >= booking.totalPrice
      ? 'Pago'
      : booking.status === BookingStatus.CANCELLED
        ? 'Reserva cancelada'
        : 'Pagamento pendente';
  const paymentBalance = Math.max(booking.totalPrice - booking.paidAmount, 0);

  return {
    balanceLabel: formatCurrencyValue(paymentBalance, booking.currency),
    checkedInLabel: booking.checkedInAt ? formatDateTimeValue(booking.checkedInAt) : null,
    courtImageSource: court?.images[0]?.url ? { uri: court.images[0].url } : DEFAULT_COURT_IMAGE,
    courtMetaLabel: court
      ? `${court.surface} / ${court.type === 'INDOOR' ? 'Indoor' : 'Outdoor'}`
      : 'Detalhes da quadra indisponiveis',
    courtName: resolvedCourtName,
    dateLabel: formatReservationDateLabel(bookingDateKey),
    durationLabel: `${booking.durationMinutes} min`,
    invitations: booking.invitations.map((invitation) => {
      const invitedUser =
        invitation.invitedUserId === currentUser?.id
          ? currentUser
          : invitation.invitedUserId
            ? (relatedUsers.get(invitation.invitedUserId) ?? null)
            : null;

      return {
        id: invitation.id,
        label:
          invitation.inviteeEmail?.trim() ||
          getResolvedUserLabel(invitedUser, invitation.invitedUserId) ||
          'Convite pendente',
        metaLabel:
          invitation.invitedUserId && invitedUser
            ? getResolvedUserMeta(invitedUser)
            : invitation.expiresAt
              ? `Expira em ${formatDateTimeValue(invitation.expiresAt)}`
              : null,
        stateLabel: formatInvitationStatusLabel(invitation.status),
      };
    }),
    organizer: {
      id: booking.organizerId,
      initials: getUserInitials(organizerUser),
      label: getResolvedUserLabel(organizerUser, booking.organizerId),
      metaLabel: getResolvedUserMeta(organizerUser),
      stateLabel: 'Organizador',
    },
    participants: booking.participants.map((participant) => {
      const relatedUser =
        participant.userId === currentUser?.id
          ? currentUser
          : (relatedUsers.get(participant.userId) ?? null);

      return {
        id: participant.userId,
        initials: getUserInitials(relatedUser),
        label: getResolvedUserLabel(relatedUser, participant.userId),
        metaLabel: getResolvedUserMeta(relatedUser),
        stateLabel: formatParticipantStatusLabel(participant.status, participant.isOrganizer),
      };
    }),
    paidAmountLabel: formatCurrencyValue(booking.paidAmount, booking.currency),
    paymentDueLabel: booking.paymentDueAt ? formatDateTimeValue(booking.paymentDueAt) : null,
    payments: [...booking.payments]
      .sort((left, right) => {
        const leftTimestamp = left.processedAt ? new Date(left.processedAt).getTime() : 0;
        const rightTimestamp = right.processedAt ? new Date(right.processedAt).getTime() : 0;

        return rightTimestamp - leftTimestamp;
      })
      .map((payment) => ({
        amountLabel: formatCurrencyValue(payment.amount, payment.currency),
        id: payment.id,
        processedAtLabel: payment.processedAt ? formatDateTimeValue(payment.processedAt) : null,
        stateLabel: formatPaymentStatusLabel(payment.status),
        title: formatPaymentTypeLabel(payment.type),
      })),
    paymentStateLabel,
    statusColor: getReservationColor(booking.status),
    statusHistory: [...booking.statusHistory]
      .sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
      .map((historyItem) => ({
        id: `${historyItem.createdAt}-${historyItem.toStatus}`,
        reasonLabel: formatHistoryReason(historyItem.reason),
        timestampLabel: formatDateTimeValue(historyItem.createdAt),
        transitionLabel: historyItem.fromStatus
          ? `${getBookingStatusLabel(historyItem.fromStatus)} -> ${getBookingStatusLabel(historyItem.toStatus)}`
          : getBookingStatusLabel(historyItem.toStatus),
      })),
    statusLabel: getBookingStatusLabel(booking.status),
    timeLabel: formatTimeRangeLabel(booking.startAt, booking.endAt),
    totalPriceLabel: formatCurrencyValue(booking.totalPrice, booking.currency),
  };
}

export function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = typeof params.id === 'string' ? params.id.trim() : '';
  const { user } = useAuthStatus();
  const bookingQuery = useBookingDetailsQuery(bookingId, {
    enabled: Boolean(bookingId),
  });
  const booking = bookingQuery.data ?? null;
  const courtQuery = useCourtQuery(booking?.courtId, {
    enabled: Boolean(booking?.courtId),
  });
  const [actionError, setActionError] = useState('');
  const cancelBookingMutation = useCancelBookingMutation();

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

  const isOrganizer = Boolean(booking && user?.id && booking.organizerId === user.id);
  const canCancelBooking = Boolean(
    isOrganizer &&
    booking &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
  const isMutating = cancelBookingMutation.isPending;
  const actionBarVisible = canCancelBooking;
  const primaryErrorMessage = getErrorMessage(
    bookingQuery.error,
    'Nao foi possivel carregar os detalhes desta reserva.'
  );

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
    }
  }

  function confirmCancelAction() {
    Alert.alert(
      'Cancelar reserva',
      'Esta acao vai libertar a quadra e atualizar o estado da reserva.',
      [
        {
          text: 'Manter reserva',
          style: 'cancel',
        },
        {
          text: 'Cancelar reserva',
          style: 'destructive',
          onPress: () => {
            void handleCancelBooking();
          },
        },
      ]
    );
  }

  if (!bookingId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <ScreenState
          description="Nao recebemos um identificador de reserva valido para abrir este ecra."
          title="Reserva invalida"
        />
      </SafeAreaView>
    );
  }

  if (bookingQuery.isLoading && !booking) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <ScreenState
          description="A carregar os detalhes da reserva selecionada."
          isLoading
          title="A carregar reserva"
        />
      </SafeAreaView>
    );
  }

  if (bookingQuery.isError || !booking || !bookingDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <ScreenState
          actionLabel="Tentar novamente"
          description={primaryErrorMessage}
          onPress={() => void bookingQuery.refetch()}
          title="Nao foi possivel abrir a reserva"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-6 py-5">
        <Pressable
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <ArrowLeft size={26} stroke="#121212" strokeWidth={2.3} />
        </Pressable>

        <Text className="text-[22px] font-semibold text-[#111111]">Detalhes da reserva</Text>

        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5 overflow-hidden rounded-[30px] bg-[#F1F1F3]">
          <Image
            className="h-48 w-full"
            resizeMode="cover"
            source={bookingDetails.courtImageSource}
          />

          <View className="px-5 py-5">
            <StatusBadge
              accentColor={bookingDetails.statusColor}
              label={bookingDetails.statusLabel}
            />

            <Text className="mt-4 text-[26px] font-semibold text-[#171717]">
              {bookingDetails.courtName}
            </Text>
            <Text className="mt-1 text-[14px] text-[#6E6E6E]">{bookingDetails.courtMetaLabel}</Text>

            <View className="mt-4 flex-row items-center">
              <CalendarDays size={16} stroke="#1F3125" strokeWidth={2.1} />
              <Text className="ml-2 text-[14px] text-[#404040]">{bookingDetails.dateLabel}</Text>
            </View>

            <View className="mt-2 flex-row items-center">
              <Clock3 size={16} stroke="#1F3125" strokeWidth={2.1} />
              <Text className="ml-2 text-[14px] text-[#404040]">{bookingDetails.timeLabel}</Text>
            </View>

            <View className="mt-5 flex-row gap-3">
              <SummaryMetric label="Total" value={bookingDetails.totalPriceLabel} />
              <SummaryMetric label="Pago" value={bookingDetails.paidAmountLabel} />
            </View>

            <View className="mt-3 flex-row gap-3">
              <SummaryMetric label="Em falta" value={bookingDetails.balanceLabel} />
              <SummaryMetric label="Duracao" value={bookingDetails.durationLabel} />
            </View>
          </View>
        </View>

        <SectionCard title="Resumo">
          <View className="flex-row items-start">
            <CreditCard size={18} stroke="#1F3125" strokeWidth={2.1} />
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold text-[#181818]">
                Estado do pagamento: {bookingDetails.paymentStateLabel}
              </Text>
              {bookingDetails.paymentDueLabel ? (
                <Text className="mt-1 text-[13px] text-[#6E6E6E]">
                  Pagamento devido ate {bookingDetails.paymentDueLabel}
                </Text>
              ) : null}
              {bookingDetails.checkedInLabel ? (
                <Text className="mt-1 text-[13px] text-[#6E6E6E]">
                  Check-in registado em {bookingDetails.checkedInLabel}
                </Text>
              ) : null}
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Participantes">
          <View className="mb-2 flex-row items-center">
            <Users size={17} stroke="#1F3125" strokeWidth={2.1} />
            <Text className="ml-2 text-[13px] text-[#6E6E6E]">
              {bookingDetails.participants.length} participante(s)
            </Text>
          </View>

          {relatedUsersQuery.isLoading ? (
            <View className="py-3">
              <ActivityIndicator color="#1F3125" size="small" />
              <Text className="mt-2 text-[12px] text-[#7A7A7A]">
                A carregar nomes dos participantes.
              </Text>
            </View>
          ) : null}

          {bookingDetails.participants.map((participant, index) => (
            <PersonRow
              key={participant.id}
              item={participant}
              showDivider={index < bookingDetails.participants.length - 1}
            />
          ))}
        </SectionCard>

        {bookingDetails.invitations.length > 0 ? (
          <SectionCard title="Convites">
            {bookingDetails.invitations.map((invitation, index) => (
              <InvitationRow
                key={invitation.id}
                item={invitation}
                showDivider={index < bookingDetails.invitations.length - 1}
              />
            ))}
          </SectionCard>
        ) : null}

        <SectionCard title="Pagamentos">
          {bookingDetails.payments.length === 0 ? (
            <Text className="text-[14px] leading-6 text-[#6E6E6E]">
              Ainda nao existem transacoes registadas para esta reserva.
            </Text>
          ) : (
            bookingDetails.payments.map((payment, index) => (
              <PaymentRow
                key={payment.id}
                item={payment}
                showDivider={index < bookingDetails.payments.length - 1}
              />
            ))
          )}
        </SectionCard>

        <SectionCard title="Historico de estado">
          {bookingDetails.statusHistory.map((historyItem, index) => (
            <HistoryRow
              key={historyItem.id}
              item={historyItem}
              showDivider={index < bookingDetails.statusHistory.length - 1}
            />
          ))}
        </SectionCard>

        {courtQuery.isError ? (
          <View className="rounded-[24px] bg-[#FFF6F1] px-5 py-4">
            <Text className="text-[14px] leading-6 text-[#8A624D]">
              Nao foi possivel carregar os detalhes completos da quadra. A reserva continua visivel
              com dados basicos.
            </Text>
          </View>
        ) : null}

        <View
          style={{
            height: actionBarVisible
              ? 176 + Math.max(insets.bottom, 20)
              : Math.max(insets.bottom, 20) + 16,
          }}
        />
      </ScrollView>

      {actionBarVisible ? (
        <View
          className="border-t border-[#ECECEF] bg-white px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
          {actionError ? (
            <Text className="mb-3 text-[13px] leading-5 text-[#D05B5B]">{actionError}</Text>
          ) : null}

          {canCancelBooking ? (
            <Pressable
              accessibilityRole="button"
              className={`items-center justify-center rounded-full border border-[#E7C2C2] bg-[#FFF5F5] ${'h-[56px]'} ${isMutating ? 'opacity-60' : ''}`}
              disabled={isMutating}
              onPress={confirmCancelAction}>
              <Text className="text-[16px] font-semibold text-[#C54D4D]">
                {cancelBookingMutation.isPending ? 'A cancelar reserva...' : 'Cancelar reserva'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
