import { Text } from 'components/app/Text';
import { Check, Trash2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { getUserDisplayName } from 'lib/auth-utils';
import type { UserContact } from 'services/user.service';

interface NewBookingGuestOptionRowProps {
  guest: UserContact;
  isDisabled: boolean;
  isSelected: boolean;
  onDeleteContact?: (contactId: string) => void;
  onPress: () => void;
}

export function NewBookingGuestOptionRow({
  guest,
  isDisabled,
  isSelected,
  onDeleteContact,
  onPress,
}: NewBookingGuestOptionRowProps) {
  const linkedName = guest.linkedUser ? getUserDisplayName(guest.linkedUser) : '';
  const displayName = guest.displayName?.trim() || linkedName || guest.email;

  return (
    <View
      className={`mb-3 flex-row items-center rounded-[22px] px-4 py-5 ${
        isSelected ? 'bg-[#EEF3ED]' : 'bg-[#F7F7F8]'
      } ${isDisabled ? 'opacity-50' : ''}`}>
      <Pressable
        accessibilityRole="button"
        className="flex-1 flex-row items-center"
        disabled={isDisabled}
        onPress={onPress}>
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Text className="text-[15px] font-semibold">{displayName.slice(0, 1).toUpperCase()}</Text>
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-medium text-[#171717]">{displayName}</Text>
          <Text className="mt-1 text-[13px] text-[#7A7A7A]">{guest.email}</Text>
        </View>

        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${
            isSelected ? 'border-primary bg-primary' : 'border-[#C7CAD1] bg-white'
          }`}>
          {isSelected ? <Check size={16} stroke="#FFFFFF" strokeWidth={2.3} /> : null}
        </View>
      </Pressable>

      {onDeleteContact ? (
        <Pressable
          accessibilityRole="button"
          className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-white"
          onPress={() => onDeleteContact(guest.id)}>
          <Trash2 size={17} stroke="#D05B5B" strokeWidth={2.1} />
        </Pressable>
      ) : null}
    </View>
  );
}
