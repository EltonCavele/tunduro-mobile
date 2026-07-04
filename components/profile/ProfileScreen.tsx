import { Text } from 'components/app/Text';
import { useState } from 'react';

import { useRouter } from 'expo-router';
import { ListGroup, Separator } from 'heroui-native';
import { Bell, LogOut, Trash2, UsersRound, Wallet } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { ConfirmationModal } from 'components/app/ConfirmationModal';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { TextInput } from 'components/app/TextInput';
import { useLogoutAllDevicesMutation } from 'hooks/useAuthMutations';
import { useDeleteAccountMutation } from 'hooks/useProfileMutation';
import { useProfileQuery } from 'hooks/useProfileQuery';
import { getErrorMessage } from 'lib/error-utils';

import { ProfileHeaderCard } from './ProfileHeaderCard';

export function ProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const logoutMutation = useLogoutAllDevicesMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (profileQuery.isPending) {
    return <AppScreenLoader message="A carregar perfil..." />;
  }

  const user = profileQuery.data;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[14px] leading-6 text-[#4C4C4C]">
            Não foi possível carregar o teu perfil.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-5 rounded-full bg-primary px-6 py-3"
            onPress={() => void profileQuery.refetch()}>
            <Text className="font-button text-[14px] text-[#171717]">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handleLogout() {
    try {
      setErrorMessage('');
      await logoutMutation.mutateAsync();
      setIsLogoutConfirmOpen(false);
      router.replace('/auth/sign-in');
    } catch (error) {
      setIsLogoutConfirmOpen(false);
      setErrorMessage(getErrorMessage(error, 'Não foi possível sair da conta. Tenta outra vez.'));
    }
  }

  function openDeleteConfirm() {
    setErrorMessage('');
    setDeleteErrorMessage('');
    setDeletePassword('');
    setIsDeleteConfirmOpen(true);
  }

  function closeDeleteConfirm() {
    if (!deleteAccountMutation.isPending) {
      setIsDeleteConfirmOpen(false);
      setDeleteErrorMessage('');
      setDeletePassword('');
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      setDeleteErrorMessage('Introduza a tua palavra-passe.');
      return;
    }

    try {
      setDeleteErrorMessage('');
      await deleteAccountMutation.mutateAsync({ currentPassword: deletePassword });
      setIsDeleteConfirmOpen(false);
      setDeletePassword('');
      router.replace('/auth/sign-in');
    } catch (error) {
      setDeleteErrorMessage(
        getErrorMessage(error, 'Não foi possível apagar a conta. Tenta outra vez.')
      );
    }
  }

  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1 bg-white">
      <ScrollView
        bounces={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View>
          <ProfileHeaderCard user={user} onEditPress={() => router.push('/profile/edit')} />

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
                    <ListGroup.ItemTitle className="text-[15px] font-semibold tracking-[-0.3px] text-[#1A1A1A]">
                      Pagamentos
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="font-label text-[12px] text-[#7E7E7E]">
                      O teu saldo e os teus pagamentos
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>

                <Separator className="mx-4 bg-[#F0F0F0]" />

                <ListGroup.Item onPress={() => router.push('/friends')}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F6]">
                      <UsersRound size={20} strokeWidth={2} color="#1B3022" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#1A1A1A]">
                      Amigos
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="font-label text-[12px] text-[#7E7E7E]">
                      Pessoas para convidar
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>

                <Separator className="mx-4 bg-[#F0F0F0]" />

                <ListGroup.Item onPress={() => router.push('/notifications')}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F6]">
                      <Bell size={20} strokeWidth={2} color="#1B3022" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-semibold tracking-[-0.3px] text-[#1A1A1A]">
                      Notificações
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="font-label text-[12px] text-[#7E7E7E]">
                      Mensagens e avisos importantes
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>
              </ListGroup>
            </View>
          </View>

          {/* Actions Section - Session */}
          <View className="mt-8 px-5">
            <Text className="mb-3 px-1 text-[13px] font-bold uppercase tracking-[1px] text-[#A0A0A0]">
              Sessão
            </Text>
            <View className="overflow-hidden rounded-3xl border border-[#F0F0F0] bg-white">
              <ListGroup>
                <ListGroup.Item onPress={() => setIsLogoutConfirmOpen(true)}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFEBEE]">
                      <LogOut size={20} strokeWidth={2} color="#EF5350" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-semibold tracking-[-0.3px] text-[#EF5350]">
                      Sair da conta
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="font-label text-[12px] text-[#7E7E7E]">
                      Termina a tua sessão neste telemóvel
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>

                <Separator className="mx-4 bg-[#F0F0F0]" />

                <ListGroup.Item onPress={openDeleteConfirm}>
                  <ListGroup.ItemPrefix>
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFEBEE]">
                      <Trash2 size={20} strokeWidth={2} color="#EF5350" />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className="text-[15px] font-semibold text-[#EF5350]">
                      Apagar conta
                    </ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="font-label text-[12px] text-[#7E7E7E]">
                      Remove o teu acesso ao app
                    </ListGroup.ItemDescription>
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

      <ConfirmationModal
        cancelLabel="Voltar"
        confirmLabel={logoutMutation.isPending ? 'A sair...' : 'Sair'}
        description="Vais sair da tua conta. Para entrar de novo vais precisar do teu e-mail ou número de telefone e a tua senha."
        isLoading={logoutMutation.isPending}
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => void handleLogout()}
        title="Terminar sessão?"
        tone="danger"
      />

      <ConfirmationModal
        cancelLabel="Voltar"
        confirmLabel={deleteAccountMutation.isPending ? 'A apagar...' : 'Apagar'}
        description="Esta ação remove a tua conta. Escreve a tua palavra-passe para confirmar."
        isLoading={deleteAccountMutation.isPending}
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={() => void handleDeleteAccount()}
        title="Apagar conta?"
        tone="danger">
        <View className="mt-5">
          <Text className="mb-2 text-[14px] font-medium text-[#202020]">Palavra-passe</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="h-12 rounded-2xl bg-[#F4F4F5] px-4 text-[15px] text-[#171717]"
            editable={!deleteAccountMutation.isPending}
            onChangeText={(value) => {
              setDeletePassword(value);
              if (deleteErrorMessage) {
                setDeleteErrorMessage('');
              }
            }}
            placeholder="A tua palavra-passe"
            placeholderTextColor="#9B9CA4"
            secureTextEntry
            textContentType="password"
            value={deletePassword}
          />
          {deleteErrorMessage ? (
            <Text className="mt-2 text-[12px] font-medium text-[#EF5350]">
              {deleteErrorMessage}
            </Text>
          ) : null}
        </View>
      </ConfirmationModal>
    </SafeAreaView>
  );
}
