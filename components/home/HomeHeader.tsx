import { Bell } from 'lucide-react-native';
import { Image, View } from 'react-native';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getUserDisplayName } from 'lib/auth-utils';

export function HomeHeader() {
  const { user } = useAuthStatus();
  const displayName = getUserDisplayName(user) || 'User';
  // Use a nice avatar color that fits the brand
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&font-size=0.35&background=1F3125&color=fff&rounded=true&bold=true`;

  return (
    <View className="flex-row items-center justify-between">
      <View className="rounded-full shadow-sm">
        <Image
          source={{ uri: avatarUrl }}
          className="h-[46px] w-[46px] overflow-hidden rounded-full bg-[#F3F4F2]"
          resizeMode="cover"
        />
      </View>

      <View className="h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F2]">
        <Bell size={20} stroke="#1F3125" strokeWidth={2} />
      </View>
    </View>
  );
}
