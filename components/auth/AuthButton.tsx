import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  className = '',
  textClassName = '',
}: AuthButtonProps) {
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      className={
        ghost
          ? `items-center justify-center py-3 ${className}`
          : `h-14 flex-row items-center justify-center rounded-full ${
              primary ? 'bg-[#1F3125]' : 'bg-[#EEF3EE]'
            } ${disabled ? 'opacity-50' : ''} ${className}`
      }
      disabled={disabled}
      onPress={onPress}>
      {Icon ? (
        <View className={ghost ? 'mr-2' : 'mr-3'}>
          <Icon
            size={18}
            stroke={primary ? '#FFFFFF' : '#1F3125'}
            strokeWidth={2.1}
          />
        </View>
      ) : null}

      <Text
        className={`text-[16px] font-semibold ${
          primary
            ? 'text-white'
            : ghost
              ? 'text-[#516252]'
              : 'text-[#1F3125]'
        } ${textClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
}
