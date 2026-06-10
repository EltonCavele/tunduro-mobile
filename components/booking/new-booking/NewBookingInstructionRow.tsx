import { Text } from 'components/app/Text';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface NewBookingInstructionRowProps {
  description?: string;
  icon: LucideIcon;
  isDisabled?: boolean;
  isSelected?: boolean;
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
  trailing?: ReactNode;
}

export function NewBookingInstructionRow({
  description,
  icon: Icon,
  isDisabled = false,
  isSelected = false,
  label,
  onPress,
  showDivider = true,
  trailing,
}: NewBookingInstructionRowProps) {
  const content = (
    <>
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          isSelected ? 'bg-[#EEF3EE]' : 'bg-[#F4F6F4]'
        }`}>
        <Icon size={20} stroke={isSelected ? '#BDE111' : '#5A5A5A'} strokeWidth={2} />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className={`font-label text-[15px] leading-[22px] ${
            isSelected ? 'text-[#101010]' : 'text-[#3A3A3A]'
          }`}>
          {label}
        </Text>
        {description ? (
          <Text className="font-label mt-1 text-[13px] leading-[19px] text-[#8A8A8A]">
            {description}
          </Text>
        ) : null}
      </View>

      {trailing}
    </>
  );

  return (
    <View>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          className={`flex-row items-center py-4 ${isDisabled ? 'opacity-45' : ''}`}
          disabled={isDisabled}
          onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        <View className="flex-row items-center py-4">{content}</View>
      )}

      {showDivider ? <View className="h-px bg-[#ECECEC]" /> : null}
    </View>
  );
}
