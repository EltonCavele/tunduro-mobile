import { Input, Label, TextField } from 'heroui-native';
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
    <TextField className="mb-7" isRequired={required}>
      <Label className="mb-3 text-[14px] font-medium text-[#181818]">{label}</Label>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <View pointerEvents="none" className="relative">
          <Input
            editable={false}
            variant="secondary"
            placeholder={placeholder}
            placeholderColorClassName="text-[#92939C]"
            value={hasValue ? value : ''}
          />

          <View className="absolute inset-y-0 right-0 justify-center pr-5">
            <ChevronDown size={24} stroke="#7E8089" strokeWidth={2} />
          </View>
        </View>
      </Pressable>
    </TextField>
  );
}
