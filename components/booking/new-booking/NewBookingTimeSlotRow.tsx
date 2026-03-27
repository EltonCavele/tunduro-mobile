import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import type { SelectableTimeSlot } from './shared';

interface NewBookingTimeSlotRowProps {
  onPress: () => void;
  slot: SelectableTimeSlot;
}

export function NewBookingTimeSlotRow({
  onPress,
  slot,
}: NewBookingTimeSlotRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[24px] px-4 py-4 ${
        slot.isSelected ? 'bg-[#E9E9EC]' : 'bg-white'
      } ${slot.isDisabled && !slot.isSelected ? 'opacity-50' : ''}`}
      disabled={slot.isDisabled && !slot.isSelected}
      onPress={onPress}>
      <LinearGradient
        className="h-12 w-12 rounded-full"
        colors={slot.accentColors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
      />

      <View className="ml-4 flex-1">
        <Text className="text-[17px] font-medium text-[#191919]">{slot.label}</Text>

        {slot.isCourtBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">Ja reservado nesta quadra</Text>
        ) : null}

        {!slot.isCourtBlocked && slot.isOrganizerBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">Conflito com outra reserva tua</Text>
        ) : null}

        {!slot.isCourtBlocked && !slot.isOrganizerBlocked && slot.isLeadTimeBlocked ? (
          <Text className="mt-1 text-[12px] text-[#8A8A8A]">
            Disponivel apenas com 30 minutos de antecedencia
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
