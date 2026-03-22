import { useState } from 'react';

import { useRouter } from 'expo-router';
import { BarChart3, LogOut, Star, Wallet } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { useLogoutAllDevicesMutation } from 'hooks/useAuthMutations';
import { useProfileQuery } from 'hooks/useProfileQuery';
import { getErrorMessage } from 'lib/error-utils';

import { ProfileActionRow } from './ProfileActionRow';
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
          <Text className="text-center text-[14px] text-[#4C4C4C]">
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-1 pb-6 pt-1">
        <ProfileHeaderCard user={user} />

        <View className="mt-4 px-3">
          <ProfileActionRow icon={Star} label="Minha subscricao" />
          <ProfileActionRow icon={Wallet} label="Pagamentos" />
          <ProfileActionRow icon={BarChart3} label="Estatisticas" />
          <ProfileActionRow
            icon={LogOut}
            isLast
            label={logoutMutation.isPending ? 'A sair...' : 'Sair da conta'}
            onPress={handleLogout}
          />

          {errorMessage ? (
            <Text className="mt-3 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
