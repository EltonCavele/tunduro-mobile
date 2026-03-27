import { useEffect, useMemo, useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronDown } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AppScreenLoader } from 'components/app/AppScreenLoader';
import type { Gender } from 'lib/auth.types';
import { formatGenderLabel, splitFullName } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';
import { useUpdateProfileMutation } from 'hooks/useProfileMutation';
import { useProfileQuery } from 'hooks/useProfileQuery';

const GENDER_OPTIONS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

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

  const genderLabel = useMemo(() => {
    if (!gender) {
      return 'Selecione o genero';
    }

    return formatGenderLabel(gender);
  }, [gender]);

  function handleGenderToggle() {
    const currentIndex = gender ? GENDER_OPTIONS.indexOf(gender) : -1;
    const nextIndex = (currentIndex + 1) % GENDER_OPTIONS.length;
    setGender(GENDER_OPTIONS[nextIndex]);
  }

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Editar perfil',
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'default',
          headerBackTitleVisible: false,
          headerBackTitle: '',
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerTransparent: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontSize: 16, fontWeight: '600', color: '#101010' },
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
            <Pressable
              accessibilityRole="button"
              className="h-[50px] flex-row items-center justify-between rounded-2xl bg-[#E9E9EC] px-4"
              onPress={handleGenderToggle}>
              <Text className="text-[15px] text-[#6D6D6D]">{genderLabel}</Text>
              <ChevronDown size={18} stroke="#6D6D6D" strokeWidth={2.2} />
            </Pressable>
          </View>

          {errorMessage ? (
            <Text className="-mt-2 mb-3 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
          ) : null}

          <View className="mt-auto">
            <AuthButton
              className="h-[52px] rounded-full"
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
