import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName } from 'lib/auth-utils';

interface NewBookingGuestOptionRowProps {
  guest: UserProfile;
  isDisabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}

export function NewBookingGuestOptionRow({
  guest,
  isDisabled,
  isSelected,
  onPress,
}: NewBookingGuestOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-[22px] px-4 py-4 ${
        isSelected ? 'bg-[#EEF3ED]' : 'bg-[#F7F7F8]'
      } ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      onPress={onPress}>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#DCE9DD]">
        <Text className="text-[13px] font-semibold text-[#1F3125]">
          {getUserDisplayName(guest).slice(0, 1).toUpperCase()}
        </Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-medium text-[#171717]">{getUserDisplayName(guest)}</Text>
        <Text className="mt-1 text-[11px] text-[#7A7A7A]">{guest.email}</Text>
      </View>

      <View
        className={`h-6 w-6 items-center justify-center rounded-full border ${
          isSelected ? 'border-[#1F3125] bg-[#1F3125]' : 'border-[#C7CAD1] bg-white'
        }`}>
        {isSelected ? <Check size={14} stroke="#FFFFFF" strokeWidth={2.3} /> : null}
      </View>
    </Pressable>
  );
}
