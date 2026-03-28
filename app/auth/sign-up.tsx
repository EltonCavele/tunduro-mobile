import { useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AuthMinimalScreen } from 'components/auth/AuthMinimalScreen';
import { useSignUpMutation } from 'hooks/useAuthMutations';
import {
  AUTH_PASSWORD_REGEX,
  getPreferredIdentifier,
  isValidEmail,
  splitFullName,
} from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

export default function SignUpScreen() {
  const router = useRouter();
  const signUpMutation = useSignUpMutation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSignUp() {
    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage('Introduza o nome completo.');
      return;
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setErrorMessage('Introduza um e-mail valido.');
      return;
    }

    if (!AUTH_PASSWORD_REGEX.test(password)) {
      setErrorMessage(
        'A palavra-passe deve ter 8+ caracteres, incluindo maiuscula, minuscula, numero e simbolo.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmacao da palavra-passe nao coincide.');
      return;
    }

    const { firstName, lastName } = splitFullName(trimmedName);

    try {
      setErrorMessage('');

      const response = await signUpMutation.mutateAsync({
        email: normalizedEmail,
        password,
        phone: normalizedPhone || undefined,
        firstName,
        lastName,
      });

      router.replace({
        pathname: '/auth/verify-account',
        params: {
          identifier: getPreferredIdentifier(response.user, normalizedEmail),
        },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel criar a conta.'));
    }
  }

  return (
    <AuthMinimalScreen
      footer={
        <Pressable
          accessibilityRole="button"
          className="items-center py-2"
          onPress={() => router.replace('/auth/sign-in')}>
          <Text className="text-[17px] font-normal text-[#181818] ">Ja tenho uma conta</Text>
        </Pressable>
      }
      title="">
      <View>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Criar conta',
            headerTitleAlign: 'center',
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitle: '',
            headerBlurEffect: 'none',
            headerShadowVisible: false,
            headerTransparent: false,
            headerStyle: { backgroundColor: '#FFFFFF' },
            sheetElevation: 0,
            headerTitleStyle: {
              fontFamily: 'Inter_900Black',
              fontSize: 16,
              fontWeight: '500',
              color: '#101010',
            },
          }}
        />
        <AuthMinimalField
          autoCapitalize="words"
          label="Nome completo"
          onChangeText={setFullName}
          placeholder="ex. Antonio Pedro"
          textContentType="name"
          value={fullName}
        />

        <AuthMinimalField
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail"
          onChangeText={setEmail}
          placeholder="ex. seu@email.com"
          textContentType="emailAddress"
          value={email}
        />

        <AuthMinimalField
          keyboardType="phone-pad"
          label="Telefone (opcional)"
          onChangeText={setPhone}
          placeholder="ex. +258841234567"
          textContentType="telephoneNumber"
          value={phone}
        />

        <AuthMinimalField
          label="Palavra-passe"
          onChangeText={setPassword}
          placeholder="Introduza a palavra-passe"
          secureTextEntry
          textContentType="newPassword"
          value={password}
        />

        <AuthMinimalField
          label="Confirmar palavra-passe"
          onChangeText={setConfirmPassword}
          placeholder="Repita a palavra-passe"
          secureTextEntry
          textContentType="newPassword"
          value={confirmPassword}
        />

        <Text className="-mt-2 mb-4 text-[12px] leading-5 text-[#6C6C6C]">
          Use 8+ caracteres com maiuscula, minuscula, numero e simbolo.
        </Text>

        {errorMessage ? (
          <Text className="-mt-1 mb-2 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
        ) : null}
      </View>

      <View className="mt-4">
        <AuthButton
          className="h-[52px]"
          isLoading={signUpMutation.isPending}
          label="Continuar"
          loadingLabel="A criar..."
          onPress={handleSignUp}
        />
      </View>
    </AuthMinimalScreen>
  );
}
