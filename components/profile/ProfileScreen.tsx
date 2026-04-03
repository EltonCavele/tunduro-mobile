import { useState } from 'react';

import { useRouter } from 'expo-router';
import { ListGroup, Separator } from 'heroui-native';
import { Bell, LogOut, Shield, Trophy, Users, Wallet } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useLogoutAllDevicesMutation } from 'hooks/useAuthMutations';
import { useProfileQuery } from 'hooks/useProfileQuery';
import { getErrorMessage } from 'lib/error-utils';

import { ProfileHeaderCard } from './ProfileHeaderCard';

export function ProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const logoutMutation = useLogoutAllDevicesMutation();
  const [errorMessage, setErrorMessage] = useState('');

  if (profileQuery.isPending) {
    return <AppScreenLoader message="A carregar perfil..." />;
  }

  const user = profileQuery.data;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[13px] text-[#4C4C4C]">
            Nao foi possivel carregar o perfil.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  async function handleLogout() {
    try {
      setErrorMessage('');
      await logoutMutation.mutateAsync();
      router.replace('/auth/sign-in');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel sair da conta.'));
    }
  }

  const stats = [
    { label: 'Jogos', value: '24', icon: Trophy },
    { label: 'Vitórias', value: '18', icon: Shield },
    { label: 'Amigos', value: '42', icon: Users },
  ];

  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1 bg-white">
      <ScrollView
        bounces={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View>
          <ProfileHeaderCard user={user} onEditPress={() => router.push('/profile/edit')} />

          {/* Stats Section */}
          <View className="mt-6 flex-row justify-between px-5">
            {stats.map((stat, index) => (
              <View
                key={index}
                className="w-[30%] items-center rounded-2xl border border-[#F0F0F0] bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F6]">
                  <stat.icon size={16} color="#1B3022" />
                </View>
                <Text className="text-[18px] font-bold text-[#1A1A1A]">{stat.value}</Text>
                <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#7E7E7E]">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions Section - Account */}
          <View className="mt-8 px-5">
            <Text className="mb-3 px-1 text-[13px] font-bold uppercase tracking-[1px] text-[#A0A0A0]">
              Conta
            </Text>
            <View className="overflow-hidden rounded-3xl border border-[#F0F0F0] bg-white">
              <ListGroup>
                <ListGroup.Item onPress={() => router.push('/payments')}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F6]">
                      <Wallet size={20} strokeWidth={2} color="#1B3022" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-medium tracking-[-0.3px] text-[#1A1A1A]">
                      Pagamentos
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="text-[12px] text-[#7E7E7E]">
                      Seu saldo e extrato
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>

                <Separator className="mx-4 bg-[#F0F0F0]" />

                <ListGroup.Item onPress={() => router.push('/profile/notifications')}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F6]">
                      <Bell size={20} strokeWidth={2} color="#1B3022" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-medium tracking-[-0.3px] text-[#1A1A1A]">
                      Notificações
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="text-[12px] text-[#7E7E7E]">
                      Sons e alertas
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>
              </ListGroup>
            </View>
          </View>

          {/* Actions Section - Preferences */}
          <View className="mt-8 px-5">
            <Text className="mb-3 px-1 text-[13px] font-bold uppercase tracking-[1px] text-[#A0A0A0]">
              Preferências
            </Text>
            <View className="overflow-hidden rounded-3xl border border-[#F0F0F0] bg-white">
              <ListGroup>
                <ListGroup.Item>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F6]">
                      <Shield size={20} strokeWidth={2} color="#1B3022" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-medium tracking-[-0.3px] text-[#1A1A1A]">
                      Privacidade
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="text-[12px] text-[#7E7E7E]">
                      Segurança da conta
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>

                <Separator className="mx-4 bg-[#F0F0F0]" />

                <ListGroup.Item onPress={handleLogout}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFEBEE]">
                      <LogOut size={20} strokeWidth={2} color="#EF5350" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-medium tracking-[-0.3px] text-[#EF5350]">
                      {logoutMutation.isPending ? 'A sair...' : 'Sair da conta'}
                    </ListGroup.ItemTitle>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>
              </ListGroup>
            </View>

            {errorMessage ? (
              <Text className="mt-4 text-center text-[12px] font-medium text-[#EF5350]">
                {errorMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
