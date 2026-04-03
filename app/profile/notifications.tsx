import { useRouter } from 'expo-router';
import { ListGroup, Separator, Switch } from 'heroui-native';
import { ArrowLeft, Bell, Mail, MessageSquare } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useNotificationPreferences } from 'hooks/useNotificationPreferences';
import { useUpdateNotificationPreferences } from 'hooks/useUpdateNotificationPreferences';

export default function NotificationsPreferencesRoute() {
  const router = useRouter();

  const { data: preferences, isLoading, isError, error, refetch } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  if (isLoading) {
    return <AppScreenLoader message="A carregar preferências..." />;
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FBFA]">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] text-[#D05B5B]">
            Erro ao carregar preferências: {error?.message}
          </Text>
          <Pressable className="mt-4 rounded-xl bg-[#1B3022] px-6 py-3" onPress={() => refetch()}>
            <Text className="text-[14px] font-bold text-white">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function handleToggle(key: 'notifyPush' | 'notifySms' | 'notifyEmail', value: boolean) {
    if (!preferences) return;
    updateMutation.mutate({
      [key]: value,
    });
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#F9FBFA]">
      <View className="flex-row items-center justify-between border-b border-[#F4F4F5] bg-white px-5 py-3">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <ArrowLeft size={20} color="#18181B" />
        </Pressable>
        <Text className="text-[17px] font-semibold text-[#18181B]">Notificações</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        <View className="mb-2 px-1">
          <Text className="text-[13px] font-bold uppercase tracking-[1px] text-[#A0A0A0]">
            Preferências de Receção
          </Text>
        </View>

        <View className="mb-8 overflow-hidden rounded-[20px] border border-[#F4F4F5] bg-white">
          <ListGroup>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAFA]">
                  <Bell size={20} strokeWidth={1.5} color="#3F3F46" />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-[15px] font-medium text-[#18181B]">
                  Notificações Push
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="text-[12px] text-[#71717A]">
                  Alertas diretos no telemóvel
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Switch
                  isSelected={preferences?.notifyPush ?? false}
                  onSelectedChange={(val) => handleToggle('notifyPush', val)}
                  isDisabled={updateMutation.isPending}
                />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>

            <Separator className="mx-4 bg-[#F4F4F5]" />

            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAFA]">
                  <MessageSquare size={20} strokeWidth={1.5} color="#3F3F46" />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-[15px] font-medium text-[#18181B]">
                  SMS
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="text-[12px] text-[#71717A]">
                  Mensagens de texto
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Switch
                  isSelected={preferences?.notifySms ?? false}
                  onSelectedChange={(val) => handleToggle('notifySms', val)}
                  isDisabled={updateMutation.isPending}
                />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>

            <Separator className="mx-4 bg-[#F4F4F5]" />

            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAFA]">
                  <Mail size={20} strokeWidth={1.5} color="#3F3F46" />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-[15px] font-medium text-[#18181B]">
                  Email
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="text-[12px] text-[#71717A]">
                  Para o teu endereço registado
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Switch
                  isSelected={preferences?.notifyEmail ?? false}
                  onSelectedChange={(val) => handleToggle('notifyEmail', val)}
                  isDisabled={updateMutation.isPending}
                />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          </ListGroup>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
