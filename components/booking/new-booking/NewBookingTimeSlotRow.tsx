import { Text } from 'components/app/Text';
import { Check, Clock3 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { SelectableTimeSlot } from './shared';

function getSlotDescription(slot: SelectableTimeSlot) {
  if (slot.isCourtBlocked) {
    return 'Campo ocupado';
  }

  if (slot.isOrganizerBlocked) {
    return 'Ja tem reserva';
  }

  if (slot.isLeadTimeBlocked) {
    return 'Muito perto da hora';
  }

  return null;
}

interface NewBookingTimeSlotRowProps {
  onPress: () => void;
  showDivider?: boolean;
  slot: SelectableTimeSlot;
}

export function NewBookingTimeSlotRow({
  onPress,
  showDivider = true,
  slot,
}: NewBookingTimeSlotRowProps) {
  const description = getSlotDescription(slot);
  const isDisabled = slot.isDisabled && !slot.isSelected;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center py-5 ${isDisabled ? 'opacity-45' : ''}`}
        disabled={isDisabled}
        onPress={onPress}>
        <View
          className={`h-12 w-12 items-center justify-center rounded-full border ${
            slot.isSelected ? 'border-[#BDE111] bg-[#EEF3EE]' : 'border-[#E8E8EC] bg-[#F4F6F4]'
          }`}>
          <Clock3 size={22} stroke={slot.isSelected ? '#BDE111' : '#5A5A5A'} strokeWidth={2} />
        </View>

        <View className="ml-4 flex-1">
          <Text
            className={`font-label text-[17px] ${
              slot.isSelected ? 'text-[#101010]' : 'text-[#3A3A3A]'
            }`}>
            {slot.label}
          </Text>

          {description ? (
            <Text className="mt-1 font-label text-[14px] leading-5 text-[#7A7A7A]">
              {description}
            </Text>
          ) : null}
        </View>

        {slot.isSelected ? (
          <View className="h-7 w-7 items-center justify-center rounded-full bg-[#BDE111]">
            <Check color="#FFFFFF" size={16} strokeWidth={3} />
          </View>
        ) : null}
      </Pressable>

      {showDivider ? <View className="h-px bg-[#ECECEC]" /> : null}
    </View>
  );
}
