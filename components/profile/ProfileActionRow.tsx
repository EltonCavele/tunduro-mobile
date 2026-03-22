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
      className={`flex-row items-center py-7 ${isLast ? 'border-b border-[#E7E7E7]' : 'border-b border-[#E7E7E7]'}`}
      onPress={onPress}>
      <View className="mr-4 w-6 items-center">
        <Icon size={20} stroke="#202020" strokeWidth={2} />
      </View>

      <Text
        className={`flex-1 text-xl font-normal text-[#151515] ${isLast ? ' !text-red-500' : ''}`}>
        {label}
      </Text>
    </Pressable>
  );
}
