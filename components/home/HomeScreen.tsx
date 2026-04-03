import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native/icons';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { HomeHeader } from './HomeHeader';
import { UpcomingMatchCard } from './UpcomingMatchCard';
import { NotificationPermissionSheet } from 'components/notifications/NotificationPermissionSheet';

import { useAuthStatus } from 'hooks/useAuthStatus';
import { useMyBookingsQuery } from 'hooks/useMyBookingsQuery';
import { useBookingUsersQuery } from 'hooks/useBookingUsersQuery';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { BookingStatus, deriveCourtLabel } from 'lib/calendar-bookings';
import { getUserDisplayName } from 'lib/auth-utils';

function EmptyUpcomingMatch() {
  return (
    <View className="mb-3 items-center justify-center rounded-[24px] border border-dashed border-[#DEE4DE] bg-[#F9FAF8] px-6 py-8">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#E5EAE4]">
        <CalendarDays size={20} stroke="#1F3125" strokeWidth={2} />
      </View>
      <Text className="text-[15px] font-bold text-[#121512]">Sem partidas marcadas</Text>
      <Text className="mt-1 text-center text-[13px] text-[#6B746D]">
        Convida um amigo ou marca uma quadra para começar a jogar.
      </Text>
    </View>
  );
}

function getDayLabel(isoString: string) {
  const date = new Date(isoString);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) return 'Hoje';

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';

  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(date);
}

function getTimeLabel(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}m`;
  return `${fmt(start)} - ${fmt(end)}`;
}

export function HomeScreen() {
  const { user } = useAuthStatus();
  const displayName = getUserDisplayName(user) || 'Visitante';
  const firstName = displayName.split(' ')[0];

  const { data: bookings = [], isLoading: isLoadingBookings } = useMyBookingsQuery();
  const { data: courts = [] } = useCourtsQuery();

  const now = new Date();
  const upcomingBookings = bookings
    .filter(
      (b) =>
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING) &&
        new Date(b.endAt).getTime() > now.getTime()
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3);

  const opponentIds = upcomingBookings
    .map((b) => b.participants.find((p) => p.userId !== user?.id)?.userId)
    .filter(Boolean) as string[];

  const { data: usersData = [] } = useBookingUsersQuery(opponentIds);

  const usersMap = new Map(usersData.map((u) => [u.id, getUserDisplayName(u)]));
  const courtsMap = new Map(courts.map((c) => [c.id, c.name]));

  return (
    <SafeAreaView edges={['right', 'left', 'top']} className="flex-1 bg-white">
      <View className="px-6 pb-4 pt-4">
        <HomeHeader />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        showsVerticalScrollIndicator={false}>
        <View className="mb-6 mt-2">
          <Text className="text-[14px] uppercase tracking-wider text-[#7A7A7A]">
            Bem-vindo de volta,
          </Text>
          <Text className="text-[32px] leading-10 text-[#202020]">{firstName}! 👋</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/bookings/new')}
          className="mb-8 flex-row items-center justify-between rounded-[28px] bg-[#BDE111] p-5">
          <View className="flex-1 pr-4">
            <Text className="text-[18px] text-[#171717]">Nova Reserva</Text>
            <Text className="mt-1 text-[13px] leading-5 text-[#3F4F19]">
              Garante a tua quadra e convida os teus parceiros de jogo.
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white">
            <Plus size={24} stroke="#171717" strokeWidth={2} />
          </View>
        </Pressable>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[18px] text-[#232323]">Próximas partidas</Text>
          <Pressable className="flex-row items-center px-2 py-1">
            <Text className="text-[14px] text-[#1F3125]">Ver agenda</Text>
            <ChevronRight size={16} stroke="#1F3125" strokeWidth={2.1} />
          </Pressable>
        </View>

        {isLoadingBookings ? (
          <View className="flex-1 items-center justify-center">
            <LoadingIndicator size="large" />
          </View>
        ) : upcomingBookings.length > 0 ? (
          upcomingBookings.map((booking) => {
            const opponentId = booking.participants.find((p) => p.userId !== user?.id)?.userId;
            const opponentName = opponentId
              ? usersMap.get(opponentId) || 'Jogador'
              : 'Sem oponente';
            const courtName = courtsMap.get(booking.courtId) || deriveCourtLabel(booking.courtId);

            return (
              <UpcomingMatchCard
                key={booking.id}
                dayLabel={getDayLabel(booking.startAt)}
                timeLabel={getTimeLabel(booking.startAt, booking.endAt)}
                courtLabel="Quadra"
                courtName={courtName}
                opponentName={opponentName}
                status={booking.status}
              />
            );
          })
        ) : (
          <EmptyUpcomingMatch />
        )}
      </ScrollView>

      <NotificationPermissionSheet />
    </SafeAreaView>
  );
}
