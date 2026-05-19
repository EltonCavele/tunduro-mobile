import { Text } from 'components/app/Text';
import { Bell, Trash2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { AppNotification } from 'lib/notifications.types';

function formatNotificationTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

interface NotificationItemProps {
  notification: AppNotification;
  onDelete: () => void;
  onPress: () => void;
}

export function NotificationItem({ notification, onDelete, onPress }: NotificationItemProps) {
  const isUnread = !notification.readAt;

  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row rounded-[20px] border px-4 py-4 ${
        isUnread ? 'border-[#D6ED95] bg-[#F7FAF2]' : 'border-[#F0F0F0] bg-white'
      }`}
      onPress={onPress}>
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          isUnread ? 'bg-[#EEF3EE]' : 'bg-[#F4F4F6]'
        }`}>
        <Bell color={isUnread ? '#1F3125' : '#7A7A7A'} size={20} strokeWidth={2} />
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className={`font-title flex-1 text-[15px] leading-5 ${
              isUnread ? 'text-[#101010]' : 'text-[#3A3A3A]'
            }`}>
            {notification.title}
          </Text>
          <Text className="font-label text-[12px] text-[#8A8A8A]">
            {formatNotificationTime(notification.createdAt)}
          </Text>
        </View>

        <Text className="font-label mt-1 text-[13px] leading-5 text-[#6B6B6B]" numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Apagar notificação"
        accessibilityRole="button"
        className="ml-2 h-9 w-9 items-center justify-center rounded-full"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onDelete();
        }}>
        <Trash2 color="#C54D4D" size={18} strokeWidth={2} />
      </Pressable>
    </Pressable>
  );
}
