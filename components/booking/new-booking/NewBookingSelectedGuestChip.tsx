import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { UserProfile } from 'lib/auth.types';
import { getUserDisplayName } from 'lib/auth-utils';

interface NewBookingSelectedGuestChipProps {
  guest: UserProfile;
  onRemove: (guestId: string) => void;
}

export function NewBookingSelectedGuestChip({
  guest,
  onRemove,
}: NewBookingSelectedGuestChipProps) {
  return (
    <View className="mr-2 mt-2 flex-row items-center rounded-full bg-[#EEF3ED] px-3 py-2">
      <Text className="text-[12px] font-medium text-[#1F3125]">{getUserDisplayName(guest)}</Text>

      <Pressable accessibilityRole="button" className="ml-2" onPress={() => onRemove(guest.id)}>
        <X size={14} stroke="#1F3125" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
