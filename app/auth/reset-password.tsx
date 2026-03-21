import { useState } from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
            </View>
          </View>

          <AuthButton
            className="h-[40px] rounded-full"
            label="Finalizar"
            onPress={() => router.replace('/auth/sign-in')}
            textClassName="text-[15px] font-medium"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
