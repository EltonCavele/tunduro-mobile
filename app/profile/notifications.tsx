import { Text } from 'components/app/Text';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ListGroup, Separator, Switch } from 'heroui-native';
import { ArrowLeft, Bell, BellOff, Mail, MessageSquare } from 'lucide-react-native';
import { AppState, Linking, Pressable, ScrollView, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { usePushNotificationSetup } from 'hooks/usePushNotificationSetup';
import { useNotificationPreferences } from 'hooks/useNotificationPreferences';
import { useUpdateNotificationPreferences } from 'hooks/useUpdateNotificationPreferences';

export default function NotificationsPreferencesRoute() {
  const router = useRouter();
  const { permissionStatus, requestAndRegister, refreshPermissionStatus } = usePushNotificationSetup();

  const { data: preferences, isLoading, isError, error, refetch } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const isDevicePushGranted = permissionStatus === 'granted';
  const isDevicePushDenied = permissionStatus === 'denied';

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissionStatus();
      }
    });

    return () => subscription.remove();
  }, [refreshPermissionStatus]);

  if (isLoading) {
    return <AppScreenLoader message="A carregar preferências..." />;
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
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

    if (key === 'notifyPush' && !isDevicePushGranted) {
      return;
    }

    updateMutation.mutate({
      [key]: value,
    });
  }

  async function handlePermissionAction() {
    if (isDevicePushDenied) {
      await Linking.openSettings();
      return;
    }

    await requestAndRegister();
    await refreshPermissionStatus();
  }

  const permissionTitle = isDevicePushGranted
    ? 'Notificações ativas no dispositivo'
    : isDevicePushDenied
      ? 'Notificações bloqueadas no dispositivo'
      : 'Ativa notificações no teu dispositivo';
  const permissionDescription = isDevicePushGranted
    ? 'Vais receber alertas de reservas, convites e atualizações importantes.'
    : isDevicePushDenied
      ? 'Para voltar a receber alertas, permite notificações nas definições do telemóvel.'
      : 'Recebe lembretes de campos, alterações de estado da reserva e mensagens importantes.';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between  bg-white px-5 py-2">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <ArrowLeft size={20} color="#18181B" />
        </Pressable>
        <Text className="text-[17px] font-semibold text-[#18181B]">Notificações</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        <View className="mb-8 overflow-hidden rounded-[28px] bg-[#F4F8F4] px-5 py-6">
          <View className="flex-row items-start">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
              {isDevicePushGranted ? (
                <Bell size={22} strokeWidth={1.9} color="#BDE111" />
              ) : (
                <BellOff size={22} strokeWidth={1.9} color="#A75A5A" />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[16px] font-semibold text-[#171717]">{permissionTitle}</Text>
              <Text className="mt-2 text-[13px] leading-5 text-[#676767]">{permissionDescription}</Text>
            </View>
          </View>

          <View className="mt-4 self-start rounded-full bg-white px-3 py-1.5">
            <Text
              className={`text-[12px] font-semibold ${
                isDevicePushGranted ? 'text-[#2D5E3B]' : 'text-[#9A4B4B]'
              }`}>
              {isDevicePushGranted ? 'Estado: Ativo' : 'Estado: Bloqueado'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className={`mt-4 items-center rounded-full px-5 py-3 ${
              isDevicePushGranted ? 'bg-[#E5ECE7]' : 'bg-[#BDE111]'
            }`}
            onPress={() => void handlePermissionAction()}>
            <Text
              className={`text-[14px] font-semibold ${
                isDevicePushGranted ? 'text-[#2D5E3B]' : 'text-white'
              }`}>
              {isDevicePushDenied ? 'Abrir definições do dispositivo' : 'Ativar notificações'}
            </Text>
          </Pressable>
        </View>

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
                <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#18181B]">
                  Notificações Push
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="font-label text-[12px] text-[#71717A]">
                  Alertas diretos no telemóvel
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Switch
                  isSelected={isDevicePushGranted && (preferences?.notifyPush ?? false)}
                  onSelectedChange={(val) => handleToggle('notifyPush', val)}
                  isDisabled={updateMutation.isPending || !isDevicePushGranted}
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
                <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#18181B]">
                  SMS
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="font-label text-[12px] text-[#71717A]">
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
                <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#18181B]">
                  Email
                </ListGroup.ItemTitle>
                <ListGroup.ItemDescription className="font-label text-[12px] text-[#71717A]">
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
