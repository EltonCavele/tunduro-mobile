import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface ProfileInfoCardProps {
  title: string;
  children: ReactNode;
}

interface ProfileInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function ProfileInfoCard({ title, children }: ProfileInfoCardProps) {
  return (
    <View className="rounded-[24px] border border-[#EDEDED] bg-white px-4 py-4">
      <Text className="mb-4 text-[14px] font-semibold tracking-[-0.2px] text-[#141414]">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function ProfileInfoRow({ icon: Icon, label, value }: ProfileInfoRowProps) {
  return (
    <View className="mb-4 flex-row items-start last:mb-0">
      <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F4]">
        <Icon size={15} stroke="#303030" strokeWidth={2} />
      </View>

      <View className="flex-1">
        <Text className="text-[11px] uppercase tracking-[0.7px] text-[#8B8B8B]">{label}</Text>
        <Text className="mt-1 text-[14px] leading-5 text-[#171717]">{value}</Text>
      </View>
    </View>
  );
}
