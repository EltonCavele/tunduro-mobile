import type { ComponentType } from 'react';
import { View } from 'react-native';

interface TabBarIconProps {
  color: string;
  focused: boolean;
  icon: ComponentType<{
    size?: number;
    stroke?: string;
    strokeWidth?: number;
  }>;
}

export function TabBarIcon({ color, focused, icon: Icon }: TabBarIconProps) {
  return (
    <View className="items-center justify-center">
      <Icon size={20} stroke={color} strokeWidth={focused ? 2 : 1.5} />
    </View>
  );
}
