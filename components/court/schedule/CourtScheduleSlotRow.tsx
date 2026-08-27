import { Text } from 'components/app/Text';
import { Lock, Plus, UserPlus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import {
  formatGuestCountLabel,
  getScheduleAvatarColor,
  type CourtScheduleRow,
} from 'lib/court-schedule';

const ROW_MIN_HEIGHT = 64;

function ReservationContent({
  reservation,
  isCurrentHour,
}: {
  reservation: NonNullable<CourtScheduleRow['reservation']>;
  isCurrentHour: boolean;
}) {
  const avatarColor = getScheduleAvatarColor(reservation.personName ?? reservation.id);

  return (
    <View
      accessible
      accessibilityLabel={`Reserva de ${reservation.displayTitle}, ${reservation.timeRangeLabel}, ${reservation.statusLabel}`}
      className="flex-1 flex-row items-center rounded-2xl px-3 py-3"
      style={{ backgroundColor: reservation.accentColor }}>
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarColor }}>
        <Text className="font-title text-[15px] text-white">{reservation.initial}</Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="font-title text-[14px] text-white" numberOfLines={1}>
          {reservation.displayTitle}
        </Text>
        <Text className="mt-0.5 text-[12px] text-white/85">{reservation.timeRangeLabel}</Text>
      </View>

      <View className="ml-2 items-end">
        {reservation.guestCount > 0 ? (
          <View className="flex-row items-center rounded-full bg-white/20 px-2.5 py-1">
            <UserPlus color="#FFFFFF" size={12} strokeWidth={2.2} />
            <Text className="ml-1 font-button text-[11px] text-white">
              {formatGuestCountLabel(reservation.guestCount)}
            </Text>
          </View>
        ) : null}

        {isCurrentHour ? (
          <View className="mt-1 rounded-full bg-white/25 px-2 py-0.5">
            <Text className="font-button text-[10px] uppercase tracking-wider text-white">
              Em curso
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ContinuationBar({ accentColor }: { accentColor: string }) {
  return (
    <View
      className="flex-1 rounded-2xl"
      style={{ backgroundColor: accentColor, opacity: 0.35, minHeight: 28 }}
    />
  );
}

function AvailableContent({ isCurrentHour }: { isCurrentHour: boolean }) {
  if (isCurrentHour) {
    return (
      <View className="flex-1 flex-row items-center justify-between rounded-2xl border border-primary bg-[#F8FCE6] px-4 py-3">
        <Text className="font-button text-[13px] text-[#3C5424]">Em curso</Text>
        <Plus color="#3C5424" size={16} strokeWidth={2.2} />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row items-center justify-between rounded-2xl border border-dashed border-[#DADADA] px-4 py-3">
      <Text className="text-[13px] text-[#9A9A9A]">Disponivel</Text>
      <Plus color="#9A9A9A" size={16} strokeWidth={2.2} />
    </View>
  );
}

function ClosedContent({
  isCurrentHour,
  closure,
  isClosureStart,
}: {
  isCurrentHour: boolean;
  closure: CourtScheduleRow['closure'];
  isClosureStart: boolean;
}) {
  if (closure) {
    return (
      <View
        accessible
        accessibilityLabel={`Campo fechado, ${closure.categoryLabel}, ${closure.reason}, ${closure.timeRangeLabel}`}
        className="flex-1 flex-row items-center rounded-2xl bg-[#FFF2E8] px-4 py-3">
        <Lock color="#B45C27" size={16} strokeWidth={2.2} />
        <View className="ml-3 flex-1">
          {closure.categoryLabel !== 'Outro motivo' && (
            <Text className="font-title text-[13px] text-[#8A431E]">{closure.categoryLabel}</Text>
          )}

          <Text className="mt-0.5 text-[12px] leading-5 text-[#6F5141]" numberOfLines={2}>
            {closure.reason}
          </Text>
          <Text className="mt-0.5 text-[11px] text-[#9A7059]">{closure.timeRangeLabel}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row items-center rounded-2xl bg-[#F2F2F2] px-4 py-3">
      <Lock color="#A6A6A6" size={14} strokeWidth={2.2} />
      <Text className="ml-2 text-[13px] text-[#9A9A9A]">
        {isCurrentHour ? 'Em curso' : 'Expirado'}
      </Text>
    </View>
  );
}

interface CourtScheduleSlotRowProps {
  row: CourtScheduleRow;
  onPressAvailable: (row: CourtScheduleRow) => void;
}

export function CourtScheduleSlotRow({ row, onPressAvailable }: CourtScheduleSlotRowProps) {
  const renderBody = () => {
    if (row.state === 'reserved' && row.reservation) {
      return row.isReservationStart ? (
        <ReservationContent reservation={row.reservation} isCurrentHour={row.isCurrentHour} />
      ) : (
        <ContinuationBar accentColor={row.reservation.accentColor} />
      );
    }

    if (row.state === 'available') {
      return (
        <Pressable
          accessibilityHint="Inicia uma reserva neste horario"
          accessibilityLabel={`Reservar ${row.hourLabel}`}
          accessibilityRole="button"
          className="flex-1"
          onPress={() => onPressAvailable(row)}>
          <AvailableContent isCurrentHour={row.isCurrentHour} />
        </Pressable>
      );
    }

    return (
      <ClosedContent
        closure={row.closure}
        isClosureStart={row.isClosureStart}
        isCurrentHour={row.isCurrentHour}
      />
    );
  };

  return (
    <View className="flex-row items-stretch px-4" style={{ minHeight: ROW_MIN_HEIGHT }}>
      <View className="w-13 pt-1.5">
        <Text
          className={`text-[12px] ${row.isCurrentHour ? 'font-title text-[#3C5424]' : 'text-[#9A9A9A]'}`}>
          {row.hourLabel}
        </Text>
      </View>

      <View className="flex-1 pb-2.5">{renderBody()}</View>
    </View>
  );
}
