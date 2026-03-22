import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { useResetPasswordMutation } from 'hooks/useAuthMutations';
import { AUTH_PASSWORD_REGEX } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const resetPasswordMutation = useResetPasswordMutation();
  const params = useLocalSearchParams<{ identifier?: string; otp?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const identifier = typeof params.identifier === 'string' ? params.identifier.trim() : '';
  const otp = typeof params.otp === 'string' ? params.otp.trim() : '';

  async function handleResetPassword() {
    if (!identifier || !otp) {
      setErrorMessage('Dados de recuperacao em falta.');
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

    try {
      setErrorMessage('');
      await resetPasswordMutation.mutateAsync({
        identifier,
        otp,
        newPassword: password,
      });
      router.replace('/auth/sign-in');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel redefinir a palavra-passe.'));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 px-6 pb-16 pt-20">
          <View className="flex-1 justify-center">
            <Text className="text-center text-[22px] font-bold tracking-[-0.3px] text-[#101010]">
              Redefinir a palavra-passe
            </Text>

            <View className="mt-16">
              <AuthMinimalField
                containerClassName="mb-6"
                inputClassName="h-[40px] rounded-xl px-3 text-[13px]"
                label="Nova palavra-passe"
                labelClassName="mb-2 text-[10px] font-medium text-[#404040]"
                onChangeText={setPassword}
                placeholder="Introduza a nova palavra-passe"
                secureTextEntry
                textContentType="newPassword"
                value={password}
              />

              <AuthMinimalField
                containerClassName="mb-0"
                inputClassName="h-[40px] rounded-xl px-3 text-[13px]"
                label="Confirmar palavra-passe"
                labelClassName="mb-2 text-[10px] font-medium text-[#404040]"
                onChangeText={setConfirmPassword}
                placeholder="Repita a nova palavra-passe"
                secureTextEntry
                textContentType="newPassword"
                value={confirmPassword}
              />

              {errorMessage ? (
                <Text className="mt-4 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
              ) : null}
            </View>
          </View>

          <AuthButton
            className="h-[40px] rounded-full"
            isLoading={resetPasswordMutation.isPending}
            label="Finalizar"
            loadingLabel="A redefinir..."
            onPress={handleResetPassword}
            textClassName="text-[15px] font-medium"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
