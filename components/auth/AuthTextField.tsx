import { useState } from 'react';

import type { LucideIcon } from 'lucide-react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

interface AuthTextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: LucideIcon;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  textContentType?: TextInputProps['textContentType'];
  secureTextEntry?: boolean;
  helperText?: string;
}

export function AuthTextField({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType,
  secureTextEntry = false,
  helperText,
}: AuthTextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const shouldHidePassword = secureTextEntry && !isPasswordVisible;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[0.9px] text-[#667066]">
        {label}
      </Text>

      <View className="flex-row items-center rounded-[22px] border border-[#E4E7E1] bg-[#F7F8F5] px-4">
        {Icon ? (
          <View className="mr-3">
            <Icon size={18} stroke="#617061" strokeWidth={2.1} />
          </View>
        ) : null}

        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          className="h-14 flex-1 text-[15px] text-[#111111]"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A198"
          secureTextEntry={shouldHidePassword}
          textContentType={textContentType}
          value={value}
        />

        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => setIsPasswordVisible((current) => !current)}>
            {isPasswordVisible ? (
              <EyeOff size={18} stroke="#516252" strokeWidth={2.1} />
            ) : (
              <Eye size={18} stroke="#516252" strokeWidth={2.1} />
            )}
          </Pressable>
        ) : null}
      </View>

      {helperText ? (
        <Text className="mt-2 text-[12px] leading-5 text-[#818881]">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
