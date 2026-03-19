import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface DayScheduleHeaderProps {
  onNextDay: () => void;
  onPreviousDay: () => void;
  reservationCount: number;
  title: string;
}

function formatReservationCount(count: number) {
  if (count === 0) {
    return 'Nenhum jogo reservado';
  }

  if (count === 1) {
    return '1 jogo reservado';
  }

  return `${count} jogos reservados`;
}

export function DayScheduleHeader({
  onNextDay,
  onPreviousDay,
  reservationCount,
  title,
}: DayScheduleHeaderProps) {
  return (
    <View className="mt-6 flex-row items-end justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-[24px] font-semibold tracking-[-0.4px] text-[#171717]">
          {title}
        </Text>
        <Text className="mt-1 text-[13px] text-[#7C7C7C]">
          {formatReservationCount(reservationCount)}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
          onPress={onPreviousDay}
        >
          <ChevronLeft size={20} stroke="#4A4A4A" strokeWidth={2.4} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full bg-[#2D333A]"
          onPress={onNextDay}
        >
          <ChevronRight size={20} stroke="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}
