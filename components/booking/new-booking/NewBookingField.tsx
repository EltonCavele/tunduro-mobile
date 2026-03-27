import { ChevronDown } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface FieldLabelProps {
  label: string;
  required?: boolean;
}

interface NewBookingFieldProps {
  label: string;
  onPress: () => void;
  placeholder: string;
  required?: boolean;
  value?: string;
}

function FieldLabel({ label, required }: FieldLabelProps) {
  return (
    <View className="mb-3 flex-row items-center">
      <Text className="text-[14px] font-medium text-[#181818]">{label}</Text>
      {required ? <Text className="ml-1 text-[16px] text-[#FF4B4B]">*</Text> : null}
    </View>
  );
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
    <View className="mb-7">
      <FieldLabel label={label} required={required} />

      <Pressable
        accessibilityRole="button"
        className="h-[56px] flex-row items-center justify-between rounded-[22px] bg-[#E9E9EC] px-5"
        onPress={onPress}>
        <Text className={`text-[14px] ${hasValue ? 'text-[#181818]' : 'text-[#92939C]'}`}>
          {hasValue ? value : placeholder}
        </Text>

        <ChevronDown size={24} stroke="#7E8089" strokeWidth={2} />
      </Pressable>
    </View>
  );
}
