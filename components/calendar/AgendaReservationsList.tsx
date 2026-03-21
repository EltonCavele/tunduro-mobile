import { FlatList, Text, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';

function EmptyReservationsState() {
  return (
    <View className="mt-6 items-center rounded-[28px] bg-white px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EEF4EF]">
        <CalendarDays size={24} stroke="#1F3125" strokeWidth={2.2} />
      </View>

      <Text className="mt-5 text-[18px] font-semibold text-[#171717]">Sem reservas nesta data</Text>
      <Text className="mt-2 text-center text-[13px] leading-5 text-[#787878]">
        Escolha outro dia no calendário para ver os jogos reservados.
      </Text>
    </View>
  );
}

function hexToRgba(hexColor: string, alpha: number) {
  const normalizedHex = hexColor.replace('#', '');

  if (normalizedHex.length !== 6) {
    return `rgba(31, 49, 37, ${alpha})`;
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pendente';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'COMPLETED':
      return 'Concluido';
    default:
      return status;
  }
}

function getDurationLabel(startLabel: string, endLabel: string) {
  const [startHour, startMinute] = startLabel.split(':').map(Number);
  const [endHour, endMinute] = endLabel.split(':').map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return '';
  }

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const durationInMinutes = Math.max(endTotalMinutes - startTotalMinutes, 0);

  return `${durationInMinutes}min`;
}

function ReservationTimelineRow({ reservation }: { reservation: CalendarReservation }) {
  const softAccent = hexToRgba(reservation.accentColor, 0.14);
  const durationLabel = getDurationLabel(reservation.startLabel, reservation.endLabel);
  const secondaryLabel =
    reservation.participantCount > 0
      ? `${reservation.courtLabel} • ${reservation.participantCount} jogadores`
      : reservation.courtLabel;

  return (
    <View className="mb-7 flex-row items-start">
      <View className="w-[84px] pr-3 pt-0.5">
        <Text className="text-[15px] font-light  text-[#1F1F1F] ">{reservation.startLabel}</Text>
        {durationLabel ? (
          <Text className="mt-1 text-sm  text-[#7A7A7A]">{durationLabel}</Text>
        ) : null}
      </View>

      <View className="flex-1 flex-row items-start">
        <View
          className="mr-4 mt-1 h-[72px] w-2 overflow-hidden rounded-full"
          style={
            {
              // backgroundColor: softAccent,
            }
          }>
          <View
            style={{
              position: 'absolute',
              left: 2,
              top: -8,
              bottom: -8,
              width: 4,
              borderRadius: 999,
              backgroundColor: reservation.accentColor,
            }}
          />
        </View>

        <View className="flex-1 pr-2">
          <View className="flex flex-row items-center justify-between gap-2">
            <Text className="text-lg font-semibold leading-6 text-[#212121]">
              {reservation.title}
            </Text>
            <View
              className="rounded-full px-[9px] py-1"
              style={{
                backgroundColor: softAccent,
              }}>
              <Text
                className="text-[10px] font-bold uppercase"
                style={{
                  color: reservation.accentColor,
                }}>
                {getStatusLabel(reservation.status)}
              </Text>
            </View>
          </View>

          <Text className="mt-1.5 text-[14px] leading-5 text-[#7A7A7A]">{secondaryLabel}</Text>

          <Text className="text-[12px] text-[#8B8B8B]">{reservation.timeRangeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

export function AgendaReservationsList({ reservations }: { reservations: CalendarReservation[] }) {
  console.log(JSON.stringify(reservations, null, 3));
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="px-5 pt-10"
      data={reservations}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyReservationsState />}
      renderItem={({ item }) => <ReservationTimelineRow reservation={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}
