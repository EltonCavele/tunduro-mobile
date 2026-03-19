import type { ComponentType } from 'react';
import { PencilLine, Search } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

function HeaderAction({
  icon: Icon,
}: {
  icon: ComponentType<{
    size?: number | string;
    stroke?: string;
    strokeWidth?: number | string;
  }>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center rounded-full bg-white"
      onPress={() => {}}>
      <Icon size={20} stroke="#1B1B1B" strokeWidth={2.2} />
    </Pressable>
  );
}

export function CalendarHeader() {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[24px] font-semibold tracking-[-0.4px] text-[#141414]">
        Agenda de jogos
      </Text>

      <View className="flex-row gap-3">
        <HeaderAction icon={Search} />
        <HeaderAction icon={PencilLine} />
      </View>
    </View>
  );
}
