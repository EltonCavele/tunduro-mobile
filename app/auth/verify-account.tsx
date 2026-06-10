import { Text } from 'components/app/Text';
import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Lock, MessageCircle } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { AuthButton } from 'components/auth/AuthButton';
import { AuthOtpInput } from 'components/auth/AuthOtpInput';
import {
  useRequestVerificationOtpMutation,
  useVerifyAccountMutation,
} from 'hooks/useAuthMutations';
import { getErrorMessage } from 'lib/error-utils';

const OTP_LENGTH = 6;
const VERIFY_PURPLE = '#BDE111';
const VERIFY_PURPLE_LIGHT = '#ECECF8';

function VerifyAccountIcon() {
  return (
    <View className="items-center">
      <View
        className="h-[104px] w-[104px] items-center justify-center rounded-full"
        style={{ backgroundColor: VERIFY_PURPLE_LIGHT }}>
        <View
          className="h-[72px] w-[72px] items-center justify-center rounded-full"
          style={{ backgroundColor: VERIFY_PURPLE }}>
          <MessageCircle color="#FFFFFF" size={30} strokeWidth={2} />
          <View className="absolute -right-0.5 -top-0.5 rounded-full bg-white p-1">
            <Lock color={VERIFY_PURPLE} size={14} strokeWidth={2.2} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function VerifyAccountScreen() {
  const router = useRouter();
  const verifyAccountMutation = useVerifyAccountMutation();
  const resendOtpMutation = useRequestVerificationOtpMutation();
  const params = useLocalSearchParams<{ identifier?: string }>();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const identifier =
    typeof params.identifier === 'string' && params.identifier.length > 0 ? params.identifier : '';
  const displayIdentifier = identifier || 'o seu contacto';

  async function handleVerifyAccount() {
    if (!identifier) {
      setErrorMessage('Identificador de verificacao em falta.');
      return;
    }

    if (code.length < OTP_LENGTH) {
      setErrorMessage(`Introduza o codigo completo de ${OTP_LENGTH} digitos.`);
      return;
    }

    try {
      setErrorMessage('');
      await verifyAccountMutation.mutateAsync({
        identifier,
        otp: code,
      });
      router.replace('/(tabs)');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel verificar a conta.'));
    }
  }

  async function handleResendOtp() {
    if (!identifier) {
      setErrorMessage('Identificador de verificacao em falta.');
      return;
    }

    try {
      setErrorMessage('');
      await resendOtpMutation.mutateAsync({
        identifier,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel reenviar o codigo.'));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-between px-7 pb-10 pt-16">
            <View className="items-center">
              <VerifyAccountIcon />

              <Text className="mt-8 text-center text-[26px] font-bold tracking-[-0.4px] text-[#101010]">
                Codigo de verificacao
              </Text>

              <Text className="mt-4 px-2 text-center text-[15px] leading-[22px] text-[#3A3A3A]">
                Introduza o codigo de verificacao que enviamos para{' '}
                <Text className="font-semibold text-[#101010]">{displayIdentifier}</Text>
              </Text>

              <AuthOtpInput
                activeCellClassName="border-[#BDE111] bg-[#BDE111]"
                activeTextClassName="text-[22px] font-semibold text-white"
                autoFocus
                cellClassName="h-[56px] w-[46px] items-center justify-center rounded-full border"
                className="mt-10"
                emptyCellClassName="border-[#D8D8DE] bg-white"
                emptyCharacter=""
                filledCellClassName="border-[#D8D8DE] bg-white"
                length={OTP_LENGTH}
                onChangeText={setCode}
                rowClassName="flex-row items-center justify-center gap-2.5"
                textClassName="text-[22px] font-semibold text-[#101010]"
                value={code}
              />

              <View className="mt-8 flex-row flex-wrap items-center justify-center">
                <Text className="text-[14px] text-[#3A3A3A]">Nao recebeu o codigo? </Text>
                <Pressable accessibilityRole="button" onPress={handleResendOtp}>
                  <Text className="text-[14px] font-semibold" style={{ color: VERIFY_PURPLE }}>
                    {resendOtpMutation.isPending ? 'A reenviar...' : 'Reenviar'}
                  </Text>
                </Pressable>
              </View>

              {errorMessage ? (
                <Text className="mt-5 px-4 text-center text-[13px] leading-5 text-[#D05B5B]">
                  {errorMessage}
                </Text>
              ) : null}
            </View>

            <AuthButton
              className="mt-10 h-[52px] rounded-full"
              disabled={code.length < OTP_LENGTH}
              isLoading={verifyAccountMutation.isPending}
              label="Confirmar"
              loadingLabel="A verificar..."
              onPress={handleVerifyAccount}
              textClassName="text-[16px] font-bold"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
