import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

import { Text } from 'components/app/Text';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { useUnreadNotificationsCount } from 'hooks/useNotificationsQuery';
import { getUserDisplayName } from 'lib/auth-utils';

export function HomeHeader() {
  const router = useRouter();
  const { user } = useAuthStatus();
  const unreadCountQuery = useUnreadNotificationsCount();
  const unreadCount = unreadCountQuery.data ?? 0;
  const displayName = getUserDisplayName(user) || 'User';
  // Use a nice avatar color that fits the brand
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&font-size=0.35&background=BDE111&color=000&rounded=true&bold=true`;

  return (
    <View className="flex-row items-center justify-between">
      <View className="rounded-full">
        <Image
          source={{ uri: avatarUrl }}
          className="w-11.5 h-11.5 overflow-hidden rounded-full bg-[#F3F4F2]"
          resizeMode="cover"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir notificações"
        className="h-11.5 w-11.5 relative items-center justify-center rounded-full bg-[#F3F4F2]"
        onPress={() => router.push('/notifications')}>
        <Bell size={20} stroke="#1F3125" strokeWidth={2} />
        {unreadCount > 0 ? (
          <View className="absolute -right-0.5 -top-0.5 min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5E4F] px-1">
            <Text className="font-button text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
