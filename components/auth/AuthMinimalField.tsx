import { useState } from 'react';
import type { ReactNode } from 'react';

import { Eye, EyeOff } from 'lucide-react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

interface AuthMinimalFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  textContentType?: TextInputProps['textContentType'];
  secureTextEntry?: boolean;
  editable?: TextInputProps['editable'];
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  rightElement?: ReactNode;
}

export function AuthMinimalField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType,
  secureTextEntry = false,
  editable = true,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  rightElement,
}: AuthMinimalFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const shouldHidePassword = secureTextEntry && !isPasswordVisible;
  const resolvedRightElement =
    rightElement ??
    (secureTextEntry ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPasswordVisible ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
        className="h-9 w-9 items-center justify-center"
        onPress={() => setIsPasswordVisible((current) => !current)}>
        {isPasswordVisible ? (
          <EyeOff size={18} stroke="#516252" strokeWidth={2.1} />
        ) : (
          <Eye size={18} stroke="#516252" strokeWidth={2.1} />
        )}
      </Pressable>
    ) : null);

  return (
    <View className={`mb-6 ${containerClassName}`}>
      <Text className={`mb-3 text-[15px] font-medium text-[#202020] ${labelClassName}`}>
        {label}
      </Text>

      <View className="relative">
        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          className={`h-[48px] rounded-2xl bg-[#E9E9EC] px-4 text-[15px] text-[#171717] ${
            resolvedRightElement ? 'pr-12' : ''
          } ${inputClassName}`}
          editable={editable}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9B9CA4"
          secureTextEntry={shouldHidePassword}
          textContentType={textContentType}
          value={value}
        />

        {resolvedRightElement ? (
          <View className="absolute right-2 top-0 h-full items-center justify-center">
            {resolvedRightElement}
          </View>
        ) : null}
      </View>
    </View>
  );
}
