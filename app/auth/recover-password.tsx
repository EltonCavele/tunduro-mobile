import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : '',
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

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
              onChangeText={setEmail}
              placeholder="ex. seu@email.com"
              textContentType="emailAddress"
              value={email}
            />
          </View>

          <View className="mt-auto">
            <AuthButton
              className="h-[48px] rounded-full"
              label="Continuar"
              onPress={() =>
                router.push({
                  pathname: '/auth/confirm-reset',
                  params: email ? { email } : undefined,
                })
              }
              textClassName="text-[15px] font-medium"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
