import { Text, View } from 'react-native';

interface NewBookingEmptyStateCardProps {
  description: string;
  title: string;
}

export function NewBookingEmptyStateCard({
  description,
  title,
}: NewBookingEmptyStateCardProps) {
  return (
    <View className="rounded-[24px] bg-[#F7F7F8] px-5 py-6">
      <Text className="text-[15px] font-semibold text-[#161616]">{title}</Text>
      <Text className="mt-2 text-[13px] leading-[19px] text-[#767676]">{description}</Text>
    </View>
  );
}
