import { Button } from 'heroui-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NewBookingFooterProps {
  children?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  loadingLabel?: string;
  onPress: () => void;
  secondaryAction?: ReactNode;
}

export function NewBookingFooter({
  children,
  disabled = false,
  isLoading = false,
  label,
  loadingLabel = 'Aguarde...',
  onPress,
  secondaryAction,
}: NewBookingFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className=" bg-white px-6 pt-4" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
      {children}

      {secondaryAction ? <View className="mb-3">{secondaryAction}</View> : null}

      <Button
        className={`h-12 rounded-xl ${disabled ? 'bg-[#C9CDC8]' : 'bg-primary'}`}
        feedbackVariant="none"
        isDisabled={disabled || isLoading}
        onPress={onPress}>
        <Button.Label className="font-button text-[17px] text-black">
          {isLoading ? loadingLabel : label}
        </Button.Label>
      </Button>
    </View>
  );
}
