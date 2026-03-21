import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AuthMinimalScreen } from 'components/auth/AuthMinimalScreen';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <AuthMinimalScreen
      footer={
        <Pressable
          accessibilityRole="button"
          className="items-center py-2"
          onPress={() => router.replace('/auth/sign-in')}>
          <Text className="text-[17px] font-normal text-[#181818]">
            Ja tenho uma conta
          </Text>
        </Pressable>
      }
      title="Criar conta">
      <View>
        <AuthMinimalField
          autoCapitalize="words"
          label="Nome completo"
          onChangeText={setFullName}
          placeholder="ex. Antonio"
          textContentType="name"
          value={fullName}
        />

        <AuthMinimalField
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail ou numero de telefone"
          onChangeText={setEmail}
          placeholder="ex. seu@email.com"
          textContentType="emailAddress"
          value={email}
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
      </View>

      <View className="mt-4">
        <AuthButton
          className="h-[52px]"
          label="Continuar"
          onPress={() =>
            router.push({
              pathname: '/auth/verify-account',
              params: { email },
            })
          }
        />
      </View>
    </AuthMinimalScreen>
  );
}
