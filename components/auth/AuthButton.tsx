import { Text } from 'components/app/Text';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
  textClassName?: string;
}

export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  isLoading = false,
  loadingLabel = 'Aguarde...',
  className = '',
  textClassName = '',
}: AuthButtonProps) {
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      className={
        ghost
          ? `items-center justify-center py-3 ${className}`
          : `h-14 flex-row items-center justify-center rounded-full ${
              primary ? ' bg-primary' : 'bg-[#EEF3EE]'
            } ${isDisabled ? 'opacity-50' : ''} ${className}`
      }
      disabled={isDisabled}
      onPress={onPress}>
      {Icon ? (
        <View className={ghost ? 'mr-2' : 'mr-3'}>
          <Icon size={18} stroke={primary ? '#BDE111' : '#BDE111'} strokeWidth={2.1} />
        </View>
      ) : null}

      <Text
        className={`font-button text-[16px] ${
          primary ? 'text-black' : ghost ? 'text-[#516252]' : 'text-[#BDE111]'
        } ${textClassName}`}>
        {isLoading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
