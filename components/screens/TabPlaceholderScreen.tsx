import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TabPlaceholderScreenProps {
  description: string;
  icon: ComponentType<{
    size?: number;
    stroke?: string;
    strokeWidth?: number;
  }>;
  title: string;
}

export function TabPlaceholderScreen({
  description,
  icon: Icon,
  title,
}: TabPlaceholderScreenProps) {
  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1 bg-[#F6F5F1]">
      <View className="flex-1 px-6 py-6">
        <View className="rounded-[28px] bg-white p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4EF]">
            <Icon size={24} stroke="#1F3125" strokeWidth={2.2} />
          </View>

          <Text className="mt-6 text-[28px] font-bold text-[#141414]">{title}</Text>
          <Text className="mt-3 text-[16px] leading-6 text-[#666666]">{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
