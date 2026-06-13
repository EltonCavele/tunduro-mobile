import { Text } from 'components/app/Text';
import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { CircleAlert, Club, Info, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { CourtScheduleTabs } from 'components/court/schedule/CourtScheduleTabs';
import { CourtScheduleTimeline } from 'components/court/schedule/CourtScheduleTimeline';
import { CourtScheduleWeekBar } from 'components/court/schedule/CourtScheduleWeekBar';
import { useCourtScheduleData } from 'hooks/useCourtScheduleData';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { getTodayClubDateKey } from 'lib/booking-reservation';
import {
  buildCourtScheduleRows,
  countReservedRows,
  formatScheduleSelectedDayLabel,
  getCourtScheduleWeek,
  shiftScheduleWeek,
  type CourtScheduleRow,
} from 'lib/court-schedule';
import { getErrorMessage } from 'lib/error-utils';

function CourtScheduleMessageState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EEF5ED]">
        {icon}
      </View>
      <Text className="mt-5 text-center font-title text-[18px] text-[#171717]">{title}</Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-[#787878]">{description}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          className="mt-6 rounded-full bg-primary px-6 py-3"
          onPress={onAction}>
          <Text className="font-button text-[14px] text-[#171717]">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CourtScheduleScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const courtsQuery = useCourtsQuery();
  const [selectedDate, setSelectedDate] = useState(() => getTodayClubDateKey());
  const [selectedCourtId, setSelectedCourtId] = useState('');

  const courts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? null,
    [courts, selectedCourtId]
  );
  const todayKey = getTodayClubDateKey();
  const weekKeys = useMemo(() => getCourtScheduleWeek(selectedDate), [selectedDate]);

  function openCourtDetails() {
    if (selectedCourtId) {
      router.push(`/courts/${selectedCourtId}`);
    }
  }

  useEffect(() => {
    if (!selectedCourtId && courts.length > 0) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  const scheduleData = useCourtScheduleData({
    courtId: selectedCourtId,
    weekKeys,
    enabled: Boolean(selectedCourtId),
  });
  const { getBookingsForDate, resolveName } = scheduleData;

  const rows = useMemo<CourtScheduleRow[]>(
    () =>
      buildCourtScheduleRows(
        selectedDate,
        getBookingsForDate(selectedDate),
        resolveName,
        new Date()
      ),
    [selectedDate, getBookingsForDate, resolveName]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedCourtId ? (
          <View className="mr-3 flex-row items-center">
            <Pressable
              accessibilityHint="Mostra os detalhes do campo selecionado"
              accessibilityLabel="Ver detalhes do campo"
              accessibilityRole="button"
              className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-[#F1F3EA]"
              onPress={() => router.push(`/courts/${selectedCourtId}`)}>
              <Info size={18} stroke="#3C5424" strokeWidth={2.2} />
            </Pressable>

            <Pressable
              accessibilityHint="Abre o formulario para criar uma nova reserva"
              accessibilityLabel="Adicionar reserva"
              accessibilityRole="button"
              className="rounded-full bg-primary p-2"
              onPress={() =>
                router.push({
                  pathname: '/bookings/new',
                  params: { courtId: selectedCourtId, date: selectedDate },
                })
              }>
              <Plus size={18} stroke="#000" strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : null,
    });
  }, [navigation, router, selectedCourtId, selectedDate]);

  function handlePressAvailable(row: CourtScheduleRow) {
    if (!selectedCourtId) {
      return;
    }

    router.push({
      pathname: '/bookings/new',
      params: { courtId: selectedCourtId, date: row.startAt.slice(0, 10) },
    });
  }

  if (courtsQuery.isPending) {
    return <AppScreenLoader message="A carregar campos..." />;
  }

  if (courtsQuery.isError && courts.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <CourtScheduleMessageState
          actionLabel="Tentar novamente"
          description={getErrorMessage(
            courtsQuery.error,
            'Tenta novamente dentro de alguns instantes.'
          )}
          icon={<CircleAlert size={26} stroke="#C96A1B" strokeWidth={2} />}
          onAction={() => void courtsQuery.refetch()}
          title="Nao foi possivel carregar os campos"
        />
      </SafeAreaView>
    );
  }

  if (courts.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <CourtScheduleMessageState
          description="Quando existirem campos ativos, a agenda de reservas vai aparecer aqui."
          icon={<Club size={26} stroke="#BDE111" strokeWidth={2} />}
          title="Nenhum campo disponivel"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <CourtScheduleTabs
        courts={courts}
        onSelectCourt={setSelectedCourtId}
        selectedCourtId={selectedCourtId}
      />

      <CourtScheduleWeekBar
        datesWithReservations={scheduleData.datesWithReservations}
        onNextWeek={() => setSelectedDate((current) => shiftScheduleWeek(current, 1))}
        onPreviousWeek={() => setSelectedDate((current) => shiftScheduleWeek(current, -1))}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        todayKey={todayKey}
        weekKeys={weekKeys}
      />

      <CourtScheduleTimeline
        courtName={selectedCourt?.name}
        dayLabel={formatScheduleSelectedDayLabel(selectedDate)}
        onPressCourtDetails={openCourtDetails}
        errorMessage={getErrorMessage(
          scheduleData.error,
          'Tenta novamente dentro de alguns instantes.'
        )}
        isError={scheduleData.isError}
        isLoading={!selectedCourtId || scheduleData.isPending}
        isRefreshing={scheduleData.isRefetching && !scheduleData.isPending}
        onPressAvailable={handlePressAvailable}
        onRefresh={() => void scheduleData.refetch()}
        onRetry={() => void scheduleData.refetch()}
        reservedCount={countReservedRows(rows)}
        rows={rows}
      />
    </SafeAreaView>
  );
}
