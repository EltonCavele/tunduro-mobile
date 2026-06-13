import { Text } from 'components/app/Text';
import { CalendarOff, ChevronRight, Info } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';

import { LoadingIndicator } from 'components/app/LoadingIndicator';
import type { CourtScheduleRow } from 'lib/court-schedule';

import { CourtScheduleSlotRow } from './CourtScheduleSlotRow';

function TimelineHeader({
  dayLabel,
  reservedCount,
  courtName,
  onPressCourtDetails,
}: {
  dayLabel: string;
  reservedCount: number;
  courtName?: string;
  onPressCourtDetails?: () => void;
}) {
  const reservedLabel =
    reservedCount === 0
      ? 'Sem reservas neste dia'
      : `${reservedCount} reserva${reservedCount === 1 ? '' : 's'} neste dia`;

  return (
    <View className="px-4 pb-3 pt-4">
      {courtName && onPressCourtDetails ? (
        <Pressable
          accessibilityHint="Mostra os detalhes do campo selecionado"
          accessibilityLabel={`Ver detalhes do ${courtName}`}
          accessibilityRole="button"
          className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F6F8EF] px-4 py-3"
          onPress={onPressCourtDetails}>
          <View className="flex-1 flex-row items-center">
            <Info size={16} stroke="#3C5424" strokeWidth={2.2} />
            <View className="ml-2.5 flex-1">
              <Text className="font-title text-[14px] text-[#171717]" numberOfLines={1}>
                {courtName}
              </Text>
              <Text className="text-[12px] text-[#6E7A55]">Ver detalhes do campo</Text>
            </View>
          </View>
          <ChevronRight size={18} stroke="#3C5424" strokeWidth={2.2} />
        </Pressable>
      ) : null}

      <Text className="font-title text-[16px] text-[#171717]">{dayLabel}</Text>
      <Text className="mt-1 text-[13px] text-[#9A9A9A]">{reservedLabel}</Text>
    </View>
  );
}

interface CourtScheduleTimelineProps {
  rows: CourtScheduleRow[];
  dayLabel: string;
  reservedCount: number;
  courtName?: string;
  onPressCourtDetails?: () => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onPressAvailable: (row: CourtScheduleRow) => void;
}

export function CourtScheduleTimeline({
  rows,
  dayLabel,
  reservedCount,
  courtName,
  onPressCourtDetails,
  isLoading,
  isError,
  errorMessage,
  isRefreshing,
  onRefresh,
  onRetry,
  onPressAvailable,
}: CourtScheduleTimelineProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <LoadingIndicator size="large" />
        <Text className="mt-4 text-center text-[13px] text-[#6F6F6F]">
          A carregar a agenda do campo.
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E8]">
          <CalendarOff size={24} stroke="#C96A1B" strokeWidth={2} />
        </View>
        <Text className="mt-5 text-center font-title text-[16px] text-[#171717]">
          Nao foi possivel carregar a agenda
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-[#787878]">
          {errorMessage}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-6 rounded-full bg-primary px-5 py-3"
          onPress={onRetry}>
          <Text className="font-button text-[14px] text-[#171717]">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 28 }}
      data={rows}
      keyExtractor={(item) => String(item.hour)}
      ListHeaderComponent={
        <TimelineHeader
          courtName={courtName}
          dayLabel={dayLabel}
          onPressCourtDetails={onPressCourtDetails}
          reservedCount={reservedCount}
        />
      }
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      renderItem={({ item }) => (
        <CourtScheduleSlotRow row={item} onPressAvailable={onPressAvailable} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
