import { Pressable, Text } from 'react-native';

interface WelcomeActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function WelcomeActionButton({
  label,
  onPress,
  variant = 'primary',
}: WelcomeActionButtonProps) {
  if (variant === 'secondary') {
    return (
      <Pressable
        accessibilityRole="button"
        className="mt-5 items-center justify-center py-2"
        onPress={onPress}>
        <Text className="text-[18px] font-medium text-[#121212]">{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="h-14 w-full items-center justify-center rounded-full bg-[#1F3125]"
      onPress={onPress}>
      <Text className="text-[17px] font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
