import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthOtpInput } from 'components/auth/AuthOtpInput';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { useForgotPasswordMutation } from 'hooks/useAuthMutations';
import { maskIdentifier } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';

export default function ConfirmResetScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const params = useLocalSearchParams<{ identifier?: string }>();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const identifier =
    typeof params.identifier === 'string' && params.identifier.length > 0 ? params.identifier : '';
  const maskedIdentifier = maskIdentifier(identifier) || 'o seu contacto';

  async function handleResendCode() {
    if (!identifier) {
      setErrorMessage('Identificador em falta.');
      return;
    }

    try {
      setErrorMessage('');
      await forgotPasswordMutation.mutateAsync({
        identifier,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel reenviar o codigo.'));
    }
  }

  function handleContinue() {
    if (!identifier) {
      setErrorMessage('Identificador em falta.');
      return;
    }

    if (code.length < 6) {
      setErrorMessage('Introduza o codigo completo de 6 digitos.');
      return;
    }

    setErrorMessage('');
    router.push({
      pathname: '/auth/reset-password',
      params: {
        identifier,
        otp: code,
      },
    });
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
              Confirmar redefinicao
            </Text>

            <View className="mt-8 items-center">
              <Text className="text-center text-[11px] leading-4 text-[#909090]">
                Enviamos um codigo para {maskedIdentifier}
              </Text>
            </View>

            <AuthOtpInput
              cellClassName="h-11 w-11 items-center justify-center rounded-xl border"
              className="mt-4 self-center"
              emptyCellClassName="border-[#E6E6EA] bg-[#F2F2F5]"
              emptyCharacter=""
              filledCellClassName="border-[#82A8FF] bg-white"
              length={6}
              onChangeText={setCode}
              rowClassName="flex-row items-center gap-2"
              textClassName="text-[16px] font-semibold text-[#101010]"
              value={code}
            />

            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-[11px] text-[#8E8E8E]">Nao recebeu o codigo?</Text>
              <Pressable accessibilityRole="button" className="ml-1" onPress={handleResendCode}>
                <Text className="text-[11px] font-semibold text-[#1F3125]">
                  {forgotPasswordMutation.isPending ? 'A reenviar...' : 'Reenviar'}
                </Text>
              </Pressable>
            </View>

            {errorMessage ? (
              <Text className="mt-4 text-center text-[13px] text-[#D05B5B]">{errorMessage}</Text>
            ) : null}
          </View>

          <AuthButton
            className="h-[48px] rounded-full"
            disabled={code.length < 6}
            label="Continuar"
            onPress={handleContinue}
            textClassName="text-[15px] font-medium"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
