import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface AuthOtpInputProps {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  className?: string;
  rowClassName?: string;
  cellClassName?: string;
  filledCellClassName?: string;
  emptyCellClassName?: string;
  textClassName?: string;
  emptyCharacter?: string;
}

export function AuthOtpInput({
  value,
  onChangeText,
  length = 6,
  className = 'mt-6',
  rowClassName = 'flex-row justify-between gap-3',
  cellClassName = 'h-16 flex-1 items-center justify-center rounded-[20px] border',
  filledCellClassName = 'border-[#1F3125] bg-[#EEF3EE]',
  emptyCellClassName = 'border-[#E4E7E1] bg-[#F7F8F5]',
  textClassName = 'text-[24px] font-semibold text-[#151515]',
  emptyCharacter = '•',
}: AuthOtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      onPress={() => inputRef.current?.focus()}>
      <View className={rowClassName}>
        {digits.map((digit, index) => (
          <View
            key={index}
            className={`${cellClassName} ${
              digit ? filledCellClassName : emptyCellClassName
            }`}>
            <Text className={textClassName}>
              {digit || emptyCharacter}
            </Text>
          </View>
        ))}
      </View>

      <TextInput
        ref={inputRef}
        autoFocus={false}
        className="absolute opacity-0"
        keyboardType="number-pad"
        maxLength={length}
        onChangeText={(text) =>
          onChangeText(text.replace(/\D/g, '').slice(0, length))
        }
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}
