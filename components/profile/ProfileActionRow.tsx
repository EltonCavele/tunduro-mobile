import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface ProfileActionRowProps {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
  isLast?: boolean;
}

export function ProfileActionRow({
  label,
  icon: Icon,
  onPress,
  isLast = false,
}: ProfileActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center py-4 ${
        isLast ? '' : 'border-b border-[#EAEAEA]'
      }`}
      onPress={onPress}>
      <View className="mr-3 w-5 items-center">
        <Icon size={16} stroke="#202020" strokeWidth={2} />
      </View>

      <Text className="flex-1 text-[14px] font-medium text-[#1A1A1A]">
        {label}
      </Text>
    </Pressable>
  );
}
