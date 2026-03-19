import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';

import { ReservationCard } from './ReservationCard';

export function ReservationsTimeline({
  reservations,
}: {
  reservations: CalendarReservation[];
}) {
  if (reservations.length === 0) {
    return (
      <View className="mt-6 items-center rounded-[28px] bg-white px-6 py-10">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EEF4EF]">
          <CalendarDays size={24} stroke="#1F3125" strokeWidth={2.2} />
        </View>

        <Text className="mt-5 text-[21px] font-semibold text-[#171717]">
          Sem reservas nesta data
        </Text>
        <Text className="mt-2 text-center text-[15px] leading-6 text-[#787878]">
          Escolha outro dia no calendário para ver os jogos reservados.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-6">
      {reservations.map((reservation) => (
        <View key={reservation.id} className="mb-6 flex-row items-start">
          <View className="w-[78px] pr-3 pt-1">
            <Text className="text-[16px] font-semibold text-[#333333]">
              {reservation.startLabel}
            </Text>
          </View>

          <View className="flex-1">
            <View className="mb-3 flex-row items-center">
              <View
                className="mr-2.5 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: reservation.accentColor }}
              />
              <View
                className="h-[2px] flex-1 rounded-full"
                style={{
                  backgroundColor: reservation.accentColor,
                  opacity: 0.35,
                }}
              />
            </View>

            <ReservationCard reservation={reservation} />
          </View>
        </View>
      ))}
    </View>
  );
}
