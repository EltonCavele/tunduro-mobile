import { CalendarDays, MapPin } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { type CalendarReservation, getBookingStatusLabel } from 'lib/calendar-bookings';

function EmptyReservationsState() {
  return (
    <View className="items-center px-6 py-16">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
        <CalendarDays size={24} stroke="#1F3125" strokeWidth={2.2} />
      </View>

      <Text className="mt-5 text-[18px] font-semibold text-[#171717]">Sem reservas nesta data</Text>
      <Text className="mt-2 text-center text-[13px] leading-6 text-[#8B8B8B]">
        Escolhe outro dia para ver as reservas agendadas.
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

  if (durationInMinutes === 0) {
    return '';
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

const PARTICIPANT_COLORS = ['#1F3125', '#5E88FC', '#F2A65A', '#D45C7A'];

function ParticipantStack({ participantCount }: { participantCount: number }) {
  const avatars = Math.min(participantCount, 4);

  if (avatars <= 0) {
    return null;
  }

  return (
    <View className="flex-row pl-3">
      {Array.from({ length: avatars }).map((_, index) => (
        <View
          key={`participant-${index}`}
          className="-ml-3 h-7 w-7 items-center justify-center rounded-full border-2 border-white"
          style={{ backgroundColor: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length] }}>
          <Text className="text-[10px] text-white">{index + 1}</Text>
        </View>
      ))}
    </View>
  );
}

function ReservationTimelineRow({
  reservation,
  onSelectBooking,
}: {
  reservation: CalendarReservation;
  onSelectBooking: (id: string) => void;
}) {
  const softAccent = hexToRgba(reservation.accentColor, 0.16);
  const accentTag = hexToRgba(reservation.accentColor, 0.24);
  const durationLabel = getDurationLabel(reservation.startLabel, reservation.endLabel);

  return (
    <View className="mb-5 flex-row items-start">
      <View className="w-[78px] pr-3 pt-2">
        <Text className="text-[16px] text-[#5F5F5F]">{reservation.startLabel}</Text>
        {durationLabel ? (
          <Text className="mt-1 text-[13px] text-[#B0B0B0]">{durationLabel}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        className="flex-1 rounded-[22px] px-4 py-4"
        onPress={() => onSelectBooking(reservation.id)}
        style={{
          backgroundColor: softAccent,
        }}>
        <View className="flex-row items-start justify-between gap-3">
          <View
            className="rounded-[10px] px-3 py-1"
            style={{
              backgroundColor: accentTag,
            }}>
            <Text
              className="text-[11px] uppercase tracking-wider"
              style={{
                color: reservation.accentColor,
              }}>
              {getBookingStatusLabel(reservation.status)}
            </Text>
          </View>

          <ParticipantStack participantCount={reservation.participantCount} />
        </View>

        <Text className="mt-4 text-[22px] text-[#202020]">{reservation.title}</Text>
        <Text className="mt-1 text-[14px] text-[#7D7D7D]">{reservation.timeRangeLabel}</Text>

        <View className="mt-4 flex-row items-center justify-between gap-3">
          <View className="flex-row items-center">
            <MapPin size={15} color="#9A9A9A" strokeWidth={2} />
            <Text className="ml-1.5 text-[13px] text-[#9A9A9A]">{reservation.courtLabel}</Text>
          </View>

          <Text className="text-[13px] text-[#9A9A9A]">
            {reservation.participantCount} jogador
            {reservation.participantCount === 1 ? '' : 'es'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export function AgendaReservationsList({
  reservations,
  onSelectBooking,
}: {
  reservations: CalendarReservation[];
  onSelectBooking: (id: string) => void;
}) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="px-5 pb-10 pt-6"
      data={reservations}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyReservationsState />}
      renderItem={({ item }) => (
        <ReservationTimelineRow reservation={item} onSelectBooking={onSelectBooking} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
