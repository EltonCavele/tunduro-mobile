import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

export function AddReservationButton() {
  return (
    <Pressable
      accessibilityRole="button"
      className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#1F3125] px-5 py-4"
      onPress={() => {}}
    >
      <View className="mr-3">
        <Plus size={18} stroke="#FFFFFF" strokeWidth={2.4} />
      </View>
      <Text className="text-[15px] font-semibold text-white">
        Adicionar reserva
      </Text>
    </Pressable>
  );
}
