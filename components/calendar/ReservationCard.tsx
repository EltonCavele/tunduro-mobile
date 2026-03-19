import { Text, View } from 'react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';

const AVATAR_COLORS = ['#F2A65A', '#5E88FC', '#2A9D8F', '#9B5DE5'];

function AvatarStack({ count }: { count: number }) {
  const avatarCount = Math.min(count, 3);

  return (
    <View className="flex-row pl-2">
      {Array.from({ length: avatarCount }).map((_, index) => (
        <View
          key={`avatar-${index}`}
          className="-ml-2 h-9 w-9 items-center justify-center rounded-full border-2 border-white"
          style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
        >
          <Text className="text-[11px] font-semibold text-white">
            {index + 1}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ReservationCard({
  reservation,
}: {
  reservation: CalendarReservation;
}) {
  return (
    <View
      className="rounded-[24px] px-5 py-4"
      style={{ backgroundColor: reservation.accentColor }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[18px] font-semibold text-white">
            {reservation.title}
          </Text>
          <Text className="mt-1 text-[14px] font-medium text-white/85">
            {reservation.timeRangeLabel}
          </Text>
          <Text className="mt-3 text-[12px] uppercase tracking-[0.8px] text-white/80">
            {reservation.courtLabel}
          </Text>
        </View>

        {reservation.participantCount > 0 ? (
          <AvatarStack count={reservation.participantCount} />
        ) : (
          <View className="rounded-full bg-white/15 px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-white">
              Sem convidados
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
