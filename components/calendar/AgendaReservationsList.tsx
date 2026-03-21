import { FlatList, Text, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';

import { ReservationCard } from './ReservationCard';

function EmptyReservationsState() {
  return (
    <View
      style={{
        marginTop: 24,
        alignItems: 'center',
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}>
      <View
        style={{
          height: 56,
          width: 56,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          backgroundColor: '#EEF4EF',
        }}>
        <CalendarDays size={24} stroke="#1F3125" strokeWidth={2.2} />
      </View>

      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '600', color: '#171717' }}>
        Sem reservas nesta data
      </Text>
      <Text
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 13,
          lineHeight: 20,
          color: '#787878',
        }}>
        Escolha outro dia no calendário para ver os jogos reservados.
      </Text>
    </View>
  );
}

function ReservationTimelineRow({ reservation }: { reservation: CalendarReservation }) {
  return (
    <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 78, paddingRight: 12, paddingTop: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#333333' }}>
          {reservation.startLabel}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              marginRight: 10,
              height: 10,
              width: 10,
              borderRadius: 999,
              backgroundColor: reservation.accentColor,
            }}
          />
          <View
            style={{
              height: 2,
              flex: 1,
              borderRadius: 999,
              backgroundColor: reservation.accentColor,
              opacity: 0.35,
            }}
          />
        </View>

        <ReservationCard reservation={reservation} />
      </View>
    </View>
  );
}

export function AgendaReservationsList({ reservations }: { reservations: CalendarReservation[] }) {
  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
      data={reservations}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyReservationsState />}
      renderItem={({ item }) => <ReservationTimelineRow reservation={item} />}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />
  );
}
