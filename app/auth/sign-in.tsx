import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AuthMinimalScreen } from 'components/auth/AuthMinimalScreen';
import { useSignInMutation } from 'hooks/useAuthMutations';
import { getPreferredIdentifier } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

export default function SignInScreen() {
  const router = useRouter();
  const signInMutation = useSignInMutation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSignIn() {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password.trim()) {
      setErrorMessage('Preencha o identificador e a palavra-passe.');
      return;
    }

    try {
      setErrorMessage('');

      const response = await signInMutation.mutateAsync({
        identifier: trimmedIdentifier,
        password,
      });

      if (response.user.isVerified) {
        router.replace('/(tabs)');
        return;
      }

      router.replace({
        pathname: '/auth/verify-account',
        params: {
          identifier: getPreferredIdentifier(response.user, trimmedIdentifier),
        },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel entrar.'));
    }
  }

  const recoverPasswordIdentifier = identifier.trim();

  return (
    <AuthMinimalScreen
      footer={
        <Pressable
          accessibilityRole="button"
          className="items-center py-2"
          onPress={() => router.push('/auth/sign-up')}>
          <Text className="text-[17px] font-normal text-[#181818]">Nao tenho uma conta</Text>
        </Pressable>
      }
      title="Entrar">
      <View>
        <AuthMinimalField
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail ou numero de telefone"
          onChangeText={setIdentifier}
          placeholder="ex. seu@email.com"
          textContentType="emailAddress"
          value={identifier}
        />

        <AuthMinimalField
          label="Palavra-passe"
          onChangeText={setPassword}
          placeholder="Introduza a sua palavra-passe"
          secureTextEntry
          textContentType="password"
          value={password}
        />

        {errorMessage ? (
          <Text className="-mt-2 mb-4 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        className="-mt-1 mb-5 self-end py-1"
        onPress={() =>
          router.push({
            pathname: '/auth/recover-password',
            params: recoverPasswordIdentifier
              ? { identifier: recoverPasswordIdentifier }
              : undefined,
          })
        }>
        <Text className="text-[14px] font-medium text-[#1F3125]">Esqueceu a palavra-passe?</Text>
      </Pressable>

      <View>
        <AuthButton
          className="h-[52px]"
          isLoading={signInMutation.isPending}
          label="Entrar"
          loadingLabel="A entrar..."
          onPress={handleSignIn}
        />
      </View>
    </AuthMinimalScreen>
  );
}
