import { useRef } from 'react';

import { Pressable, View, type TextInput as RNTextInput } from 'react-native';

import { Text } from 'components/app/Text';
import { TextInput } from 'components/app/TextInput';

interface AuthOtpInputProps {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  className?: string;
  rowClassName?: string;
  cellClassName?: string;
  filledCellClassName?: string;
  activeCellClassName?: string;
  emptyCellClassName?: string;
  textClassName?: string;
  activeTextClassName?: string;
  emptyCharacter?: string;
  autoFocus?: boolean;
}

export function AuthOtpInput({
  value,
  onChangeText,
  length = 6,
  className = 'mt-6',
  rowClassName = 'flex-row justify-between gap-3',
  cellClassName = 'h-16 flex-1 items-center justify-center rounded-[20px] border',
  filledCellClassName = 'border-[#BDE111] bg-[#EEF3EE]',
  activeCellClassName,
  emptyCellClassName = 'border-[#E4E7E1] bg-[#F7F8F5]',
  textClassName = 'text-[24px] font-semibold text-[#151515]',
  activeTextClassName,
  emptyCharacter = '•',
  autoFocus = false,
}: AuthOtpInputProps) {
  const inputRef = useRef<RNTextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');
  const activeIndex = value.length < length ? value.length : length - 1;

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      onPress={() => inputRef.current?.focus()}>
      <View className={rowClassName}>
        {digits.map((digit, index) => {
          const isActive = index === activeIndex;
          const cellStateClassName = isActive
            ? (activeCellClassName ?? filledCellClassName)
            : digit
              ? filledCellClassName
              : emptyCellClassName;

          return (
            <View key={index} className={`${cellClassName} ${cellStateClassName}`}>
              <Text
                className={
                  isActive && activeTextClassName ? activeTextClassName : textClassName
                }>
                {digit || emptyCharacter}
              </Text>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        autoFocus={autoFocus}
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
