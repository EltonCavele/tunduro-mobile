import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthOtpInput } from 'components/auth/AuthOtpInput';

export default function VerifyAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const email =
    typeof params.email === 'string' && params.email.length > 0
      ? params.email
      : 'seuemail@clubetm.co.mz';
  const maskedEmail = email.replace(/^(.{3}).+(@.*)$/, '$1***$2');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 px-6 pb-16 pt-20">
          <View className="flex-1 justify-center">
            <Text className="text-center text-[22px] font-bold tracking-[-0.3px] text-[#101010]">
              Verificar conta
            </Text>

            <View className="mt-8 items-center">
              <Text className="text-center text-[11px] leading-4 text-[#909090]">
                Enviamos um codigo para {maskedEmail}
              </Text>
            </View>

            <AuthOtpInput
              cellClassName="h-11 w-11 items-center justify-center rounded-xl border"
              className="mt-4 self-center"
              emptyCellClassName="border-[#E6E6EA] bg-[#F2F2F5]"
              emptyCharacter=""
              filledCellClassName="border-[#82A8FF] bg-white"
              length={5}
              onChangeText={setCode}
              rowClassName="flex-row items-center gap-2"
              textClassName="text-[16px] font-semibold text-[#101010]"
              value={code}
            />

            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-[11px] text-[#8E8E8E]">
                Nao recebeu o codigo?
              </Text>
              <Pressable
                accessibilityRole="button"
                className="ml-1"
                onPress={() => {}}>
                <Text className="text-[11px] font-semibold text-[#1F3125]">
                  Reenviar
                </Text>
              </Pressable>
            </View>
          </View>

          <AuthButton
            className="h-[40px] rounded-full"
            disabled={code.length < 5}
            label="Finalizar"
            onPress={() => router.replace('/(tabs)/inicio')}
            textClassName="text-[15px] font-medium"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
