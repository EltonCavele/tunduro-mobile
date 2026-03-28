import { useEffect, useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Select } from 'heroui-native';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import type { Gender } from 'lib/auth.types';
import { formatGenderLabel, splitFullName } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';
import { useUpdateProfileMutation } from 'hooks/useProfileMutation';
import { useProfileQuery } from 'hooks/useProfileQuery';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: formatGenderLabel('MALE') },
  { value: 'FEMALE', label: formatGenderLabel('FEMALE') },
  { value: 'OTHER', label: formatGenderLabel('OTHER') },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const user = profileQuery.data;

  useEffect(() => {
    if (!user || isInitialized) {
      return;
    }

    const initialFullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

    setFullName(initialFullName);
    setPhone(user.phone ?? '');
    setEmail(user.email ?? '');
    setGender(user.gender ?? null);
    setIsInitialized(true);
  }, [isInitialized, user]);

  const selectedGenderOption = gender
    ? GENDER_OPTIONS.find((option) => option.value === gender)
    : undefined;

  async function handleSave() {
    if (!user) {
      setErrorMessage('Nao foi possivel carregar o perfil.');
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('Introduza o nome completo.');
      return;
    }

    const { firstName, lastName } = splitFullName(trimmedName);
    const trimmedPhone = phone.trim();

    try {
      setErrorMessage('');
      await updateProfileMutation.mutateAsync({
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phone: trimmedPhone ? trimmedPhone : null,
        gender: gender ?? null,
        avatarUrl: user.avatarUrl ?? null,
        level: user.level ?? null,
      });

      router.back();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel atualizar o perfil.'));
    }
  }

  if (profileQuery.isPending) {
    return <AppScreenLoader message="A carregar perfil..." />;
  }

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

  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Editar perfil',
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerTransparent: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: {
            fontFamily: 'Inter_900Black',
            fontSize: 16,
            fontWeight: '600',
            color: '#101010',
          },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 px-6 pb-8 pt-6">
          <AuthMinimalField
            autoCapitalize="words"
            inputClassName="h-[50px] rounded-2xl text-[15px]"
            label="Nome completo"
            labelClassName="mb-2 text-[13px] font-medium text-[#2B2B2B]"
            onChangeText={setFullName}
            placeholder="ex. Antonio"
            value={fullName}
          />

          <AuthMinimalField
            keyboardType="phone-pad"
            inputClassName="h-[50px] rounded-2xl text-[15px]"
            label="Numero de telefone"
            labelClassName="mb-2 text-[13px] font-medium text-[#2B2B2B]"
            onChangeText={setPhone}
            placeholder="ex. 84 123 4567"
            value={phone}
          />

          <AuthMinimalField
            autoCapitalize="none"
            editable={false}
            inputClassName="h-[50px] rounded-2xl text-[15px] text-[#8C8C8C]"
            keyboardType="email-address"
            label="Endereco de e-mail"
            labelClassName="mb-2 text-[13px] font-medium text-[#2B2B2B]"
            onChangeText={setEmail}
            placeholder="ex. seu@email.com"
            value={email}
          />

          <View className="mb-6">
            <Text className="mb-2 text-[13px] font-medium text-[#2B2B2B]">Genero</Text>
            <Select
              onValueChange={(option) => setGender((option?.value as Gender | undefined) ?? null)}
              value={selectedGenderOption}>
              <Select.Trigger className="min-h-12.5 rounded-2xl bg-[#E9E9EC] px-4 shadow-none">
                <Select.Value className="text-[15px]" placeholder="Selecione o genero" />
                <Select.TriggerIndicator iconProps={{ color: '#6D6D6D', size: 18 }} />
              </Select.Trigger>

              <Select.Portal>
                <Select.Overlay className="bg-black/10" />
                <Select.Content
                  className="rounded-2xl bg-white p-2 shadow-none"
                  presentation="popover"
                  width="trigger">
                  <Select.ListLabel className="px-3 pt-2 text-[13px] font-medium text-[#2B2B2B]">
                    Selecione o genero
                  </Select.ListLabel>

                  {GENDER_OPTIONS.map((option) => (
                    <Select.Item
                      key={option.value}
                      className="rounded-xl px-3 py-3"
                      label={option.label}
                      value={option.value}>
                      <Select.ItemLabel className="text-[15px] text-[#2B2B2B]" />
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>
          </View>

          {errorMessage ? (
            <Text className="-mt-2 mb-3 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
          ) : null}

          <View className="mt-auto">
            <AuthButton
              className="h-13 rounded-full"
              isLoading={updateProfileMutation.isPending}
              label="Salvar"
              loadingLabel="A salvar..."
              onPress={handleSave}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
