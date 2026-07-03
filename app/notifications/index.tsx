import { Text } from 'components/app/Text';
import { useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { ArrowLeft, BellOff, Settings } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { ConfirmationModal } from 'components/app/ConfirmationModal';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { NotificationItem } from 'components/notifications/NotificationItem';
import { useDeleteNotificationMutation } from 'hooks/useDeleteNotificationMutation';
import { useMarkNotificationReadMutation } from 'hooks/useMarkNotificationReadMutation';
import { useNotificationsQuery } from 'hooks/useNotificationsQuery';
import { getErrorMessage } from 'lib/error-utils';
import { navigateFromNotificationData } from 'lib/notification-navigation';
import type { AppNotification, NotificationReadFilter } from 'lib/notifications.types';

const FILTERS: { label: string; value: NotificationReadFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Não lidas', value: 'unread' },
  { label: 'Lidas', value: 'read' },
];

export default function NotificationsRoute() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<NotificationReadFilter>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  const notificationsQuery = useNotificationsQuery(activeFilter);
  const markReadMutation = useMarkNotificationReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data]
  );

  const isInitialLoading = notificationsQuery.isLoading && notifications.length === 0;
  const isRefreshing = notificationsQuery.isRefetching && !notificationsQuery.isFetchingNextPage;

  async function handlePressNotification(notification: AppNotification) {
    if (!notification.readAt) {
      try {
        await markReadMutation.mutateAsync(notification.id);
      } catch {
        // Navigation still proceeds if mark-read fails transiently.
      }
    }

    navigateFromNotificationData(router, notification.data);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) {
      return;
    }

    try {
      setDeleteErrorMessage('');
      await deleteMutation.mutateAsync(pendingDeleteId);
      setPendingDeleteId(null);
    } catch (error) {
      setDeleteErrorMessage(
        getErrorMessage(error, 'Não foi possível apagar esta notificação.')
      );
    }
  }

  if (isInitialLoading) {
    return <AppScreenLoader message="A carregar notificações..." />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between  px-5 py-3">
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <ArrowLeft color="#18181B" size={20} />
        </Pressable>

        <Text className="font-title text-[17px] text-[#18181B]">Notificações</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Definições de notificações"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA]"
          onPress={() => router.push('/profile/notifications')}>
          <Settings color="#18181B" size={18} />
        </Pressable>
      </View>

      <View className="mb-5 flex h-10 flex-row  items-center gap-2 px-6">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <Pressable
              key={filter.value}
              accessibilityRole="button"
              className={`h-10 rounded-full px-4 py-2 ${
                isActive ? 'bg-[#BDE111]' : 'border border-[#ECECEC] bg-white'
              }`}
              onPress={() => setActiveFilter(filter.value)}>
              <Text
                className={`font-button text-[13px] ${isActive ? 'text-[#171717]' : 'text-[#3A3A3A]'}`}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {notificationsQuery.isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] text-[#D05B5B]">
            {getErrorMessage(
              notificationsQuery.error,
              'Não foi possível carregar as notificações.'
            )}
          </Text>
          <Pressable
            className="mt-4 rounded-full bg-primary px-6 py-3"
            onPress={() => void notificationsQuery.refetch()}>
            <Text className="font-button text-[14px] text-black">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 24,
            paddingHorizontal: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void notificationsQuery.refetch()}
            />
          }
          onEndReached={() => {
            if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
              void notificationsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-4 py-16">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F6]">
                <BellOff color="#7A7A7A" size={24} strokeWidth={2} />
              </View>
              <Text className="text-center font-title text-[17px] text-[#18181B]">
                Sem notificações
              </Text>
              <Text className="mt-2 text-center font-label text-[14px] leading-5 text-[#71717A]">
                {activeFilter === 'unread'
                  ? 'Estás em dia — não tens notificações por ler.'
                  : activeFilter === 'read'
                    ? 'Ainda não leste nenhuma notificação.'
                    : 'Quando houver novidades sobre reservas ou convites, aparecem aqui.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            notificationsQuery.isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#BDE111" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onDelete={() => {
                setDeleteErrorMessage('');
                setPendingDeleteId(item.id);
              }}
              onPress={() => void handlePressNotification(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmationModal
        confirmLabel={deleteMutation.isPending ? 'A apagar...' : 'Apagar'}
        description="Esta notificação será removida permanentemente."
        isLoading={deleteMutation.isPending}
        isOpen={Boolean(pendingDeleteId)}
        onClose={() => {
          setPendingDeleteId(null);
          setDeleteErrorMessage('');
        }}
        onConfirm={() => void handleConfirmDelete()}
        title="Apagar notificação"
        tone="danger">
        {deleteErrorMessage ? (
          <Text className="mt-3 font-label text-[13px] leading-5 text-[#D05B5B]">
            {deleteErrorMessage}
          </Text>
        ) : null}
      </ConfirmationModal>
    </SafeAreaView>
  );
}
