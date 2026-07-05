import { Text } from 'components/app/Text';
import { ChevronDown } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface NewBookingFieldProps {
  label: string;
  onPress: () => void;
  placeholder: string;
  required?: boolean;
  value?: string;
}

export function NewBookingField({
  label,
  onPress,
  placeholder,
  required,
  value,
}: NewBookingFieldProps) {
  const hasValue = Boolean(value?.trim());

  return (
    <View className="mb-6">
      <Text className="mb-2 font-label text-[16px] text-[#202020]">
        {label}
        {required ? <Text className="text-[#C54D4D]"> *</Text> : null}
      </Text>

      <Pressable accessibilityRole="button" onPress={onPress}>
        <View className="h-12 flex-row items-center rounded-xl border border-[#D8D8DE] bg-white px-4">
          <Text
            className={`flex-1 font-input text-[16px] ${
              hasValue ? 'text-[#171717]' : 'text-[#92939C]'
            }`}>
            {hasValue ? value : placeholder}
          </Text>

          <ChevronDown size={24} stroke="#7E8089" strokeWidth={2} />
        </View>
      </Pressable>
    </View>
  );
}
