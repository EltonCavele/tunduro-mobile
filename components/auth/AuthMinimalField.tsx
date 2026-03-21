import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

interface AuthMinimalFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  textContentType?: TextInputProps['textContentType'];
  secureTextEntry?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
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
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
}: AuthMinimalFieldProps) {
  return (
    <View className={`mb-6 ${containerClassName}`}>
      <Text className={`mb-3 text-[15px] font-medium text-[#202020] ${labelClassName}`}>
        {label}
      </Text>

      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className={`h-[48px] rounded-2xl bg-[#E9E9EC] px-4 text-[15px] text-[#171717] ${inputClassName}`}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9B9CA4"
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
        value={value}
      />
    </View>
  );
}
