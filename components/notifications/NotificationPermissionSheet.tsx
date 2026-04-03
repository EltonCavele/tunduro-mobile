import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { usePushNotificationSetup } from 'hooks/usePushNotificationSetup';
import { NewBookingSheet } from 'components/booking/new-booking/NewBookingSheet';

export function NotificationPermissionSheet() {
  const { hasSeenPrompt, permissionStatus, requestAndRegister, dismissPrompt } =
    usePushNotificationSetup();

  // Adicionamos um atraso porque muitas vezes o BottomSheet precisa ser montado (com isOpen={false})
  // antes de receber receber isOpen={true}, senao ele nao aparece por causa das refs iniciais.
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const isVisible = isReady && permissionStatus !== 'granted';

  console.log(isVisible, 'TESTE');
  console.log(hasSeenPrompt, 'hasSeenPrompt');
  console.log(permissionStatus, 'permissionStatus');

  console.log(isReady, 'isReady');
  return (
    <NewBookingSheet
      title="Notificações"
      visible={isVisible}
      onClose={() => dismissPrompt()}
      snapPoints={['60%']}>
      <View className="items-center pb-4">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-[#FAFAFA]">
          <Bell size={32} color="#18181B" strokeWidth={1.5} />
        </View>

        <Text className="mb-2 text-center text-[22px] font-bold tracking-tight text-[#18181B]">
          Fica a par de tudo
        </Text>
        <Text className="mb-8 text-center text-[15px] leading-6 text-[#71717A]">
          Recebe atualizações sobre as tuas reservas, lembretes de jogos e alertas importantes.
          Podes desativar a qualquer momento.
        </Text>

        <Pressable
          className="w-full flex-row items-center justify-center rounded-full bg-[#18181B] py-4 shadow-sm"
          onPress={async () => {
            await requestAndRegister();
          }}>
          <Text className="text-[16px] font-semibold text-white">Ativar Notificações</Text>
        </Pressable>

        <Pressable className="mt-4 w-full py-3" onPress={() => dismissPrompt()}>
          <Text className="text-center text-[15px] font-medium text-[#71717A]">Agora não</Text>
        </Pressable>
      </View>
    </NewBookingSheet>
  );
}
