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
        className={`h-12 w-12 items-center justify-center rounded-full ${
          isSelected ? 'bg-[#EEF3EE]' : 'bg-[#F4F6F4]'
        }`}>
        <Icon size={22} stroke={isSelected ? '#BDE111' : '#5A5A5A'} strokeWidth={2} />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className={`font-label text-[17px] leading-[24px] ${
            isSelected ? 'text-[#101010]' : 'text-[#3A3A3A]'
          }`}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-1 font-label text-[14px] leading-[20px] text-[#7A7A7A]">
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
          className={`flex-row items-center py-5 ${isDisabled ? 'opacity-45' : ''}`}
          disabled={isDisabled}
          onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        <View className="flex-row items-center py-5">{content}</View>
      )}

      {showDivider ? <View className="h-px bg-[#ECECEC]" /> : null}
    </View>
  );
}
