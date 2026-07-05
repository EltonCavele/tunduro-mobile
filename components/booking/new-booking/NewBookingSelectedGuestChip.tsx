import { Text } from 'components/app/Text';
import { X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { getUserDisplayName } from 'lib/auth-utils';
import type { UserContact } from 'services/user.service';

interface NewBookingSelectedGuestChipProps {
  guest: UserContact;
  onRemove: (guestId: string) => void;
}

export function NewBookingSelectedGuestChip({ guest, onRemove }: NewBookingSelectedGuestChipProps) {
  const linkedName = guest.linkedUser ? getUserDisplayName(guest.linkedUser) : '';
  const displayName = guest.displayName?.trim() || linkedName || guest.email;

  return (
    <View className="mr-2 mt-2 flex-row items-center rounded-xl bg-primary px-4 py-3">
      <Text className="text-[14px] font-medium">{displayName}</Text>

      <Pressable accessibilityRole="button" className="ml-2" onPress={() => onRemove(guest.id)}>
        <X size={16} stroke="black" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
