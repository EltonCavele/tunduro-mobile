import { useState } from 'react';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useForgotPasswordMutation } from 'hooks/useAuthMutations';
import { getErrorMessage } from 'lib/error-utils';

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const params = useLocalSearchParams<{ identifier?: string }>();
  const [identifier, setIdentifier] = useState(
    typeof params.identifier === 'string' ? params.identifier : ''
  );
  const [errorMessage, setErrorMessage] = useState('');

  async function handleRecoverPassword() {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setErrorMessage('Introduza o e-mail ou numero de telefone.');
      return;
    }

    try {
      setErrorMessage('');
      await forgotPasswordMutation.mutateAsync({
        identifier: trimmedIdentifier,
      });

      router.push({
        pathname: '/auth/confirm-reset',
        params: { identifier: trimmedIdentifier },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel enviar o codigo.'));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Recuperar senha',
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerTransparent: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          sheetElevation: 0,
          headerTitleStyle: { fontSize: 16, fontWeight: '500', color: '#101010' },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 px-6 pb-16 pt-20">
          <View className="pt-8">
            <Text className="text-center text-[28px] font-bold tracking-[-0.4px] text-[#101010]">
              Recuperar senha
            </Text>
          </View>

          <View className="mt-20">
            <AuthMinimalField
              autoCapitalize="none"
              containerClassName="mb-0"
              inputClassName="h-[46px] rounded-xl px-4 text-[14px]"
              keyboardType="email-address"
              label="E-mail ou numero de telefone"
              labelClassName="mb-2 text-[13px] font-medium text-[#404040]"
              onChangeText={setIdentifier}
              placeholder="ex. seu@email.com"
              textContentType="emailAddress"
              value={identifier}
            />

            {errorMessage ? (
              <Text className="mt-4 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
            ) : null}
          </View>

          <View className="mt-auto">
            <AuthButton
              className="h-[48px] rounded-full"
              isLoading={forgotPasswordMutation.isPending}
              label="Continuar"
              loadingLabel="A enviar..."
              onPress={handleRecoverPassword}
              textClassName="text-[15px] font-medium"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
