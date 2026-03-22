import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface AddReservationButtonProps {
  selectedDate: string;
}

export function AddReservationButton({ selectedDate }: AddReservationButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-center rounded-full bg-[#1F3125] px-5 py-4"
      onPress={() =>
        router.push({
          pathname: '/bookings/new',
          params: {
            date: selectedDate,
          },
        })
      }
      style={{
        elevation: 8,
        shadowColor: '#102017',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      }}>
      <View className="mr-3">
        <Plus size={18} stroke="#FFFFFF" strokeWidth={2.4} />
      </View>
      <Text className="text-[15px] font-semibold text-white">Adicionar reserva</Text>
    </Pressable>
  );
}
