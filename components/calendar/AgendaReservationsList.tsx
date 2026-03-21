import { FlatList, Text, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';

import type { CalendarReservation } from 'lib/calendar-bookings';

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
    <View style={{ marginBottom: 28, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 84, paddingRight: 12, paddingTop: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#1F1F1F' }}>
          {reservation.startLabel}
        </Text>
        {durationLabel ? (
          <Text style={{ marginTop: 4, fontSize: 13, color: '#7A7A7A' }}>{durationLabel}</Text>
        ) : null}
      </View>

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            marginRight: 16,
            marginTop: 4,
            height: 72,
            width: 8,
            borderRadius: 999,
            backgroundColor: softAccent,
            overflow: 'hidden',
          }}>
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

        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            style={{
              fontSize: 17,
              lineHeight: 24,
              fontWeight: '500',
              color: '#212121',
            }}>
            {reservation.title}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              lineHeight: 20,
              color: '#7A7A7A',
            }}>
            {secondaryLabel}
          </Text>

          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                borderRadius: 999,
                backgroundColor: softAccent,
                paddingHorizontal: 9,
                paddingVertical: 4,
              }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: reservation.accentColor,
                  textTransform: 'uppercase',
                }}>
                {getStatusLabel(reservation.status)}
              </Text>
            </View>

            <Text
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: '#8B8B8B',
              }}>
              {reservation.timeRangeLabel}
            </Text>
          </View>
        </View>
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
