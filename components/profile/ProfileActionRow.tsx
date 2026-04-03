import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface ProfileActionRowProps {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
  isLast?: boolean;
  description?: string;
  value?: string;
}

export function ProfileActionRow({
  label,
  icon: Icon,
  onPress,
  isLast = false,
  description,
  value,
}: ProfileActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center border-b border-[#F0F0F0] py-4 last:border-b-0"
      onPress={onPress}>
      <View
        className={`mr-4 h-10 w-10 items-center justify-center rounded-xl ${
          isLast ? 'bg-[#FFEBEE]' : 'bg-[#F5F7F6]'
        }`}>
        <Icon size={20} strokeWidth={2} color={isLast ? '#EF5350' : '#1B3022'} />
      </View>

      <View className="flex-1">
        <Text
          className={`text-[15px] font-medium tracking-[-0.3px] ${
            isLast ? 'text-[#EF5350]' : 'text-[#1A1A1A]'
          }`}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-[12px] text-[#7E7E7E]">{description}</Text>
        ) : null}
      </View>

      {value ? <Text className="mr-2 text-[14px] font-medium text-[#7E7E7E]">{value}</Text> : null}

      {!isLast && <ChevronRight size={18} stroke="#C7C7C7" strokeWidth={2} />}
    </Pressable>
  );
}
