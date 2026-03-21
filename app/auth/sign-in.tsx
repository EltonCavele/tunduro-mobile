import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthButton } from 'components/auth/AuthButton';
import { AuthMinimalField } from 'components/auth/AuthMinimalField';
import { AuthMinimalScreen } from 'components/auth/AuthMinimalScreen';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthMinimalScreen
      footer={
        <Pressable
          accessibilityRole="button"
          className="items-center py-2"
          onPress={() => router.push('/auth/sign-up')}>
          <Text className="text-[17px] font-normal text-[#181818]">
            Nao tenho uma conta
          </Text>
        </Pressable>
      }
      title="Entrar">
      <View>
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
          placeholder="Introduza a sua palavra-passe"
          secureTextEntry
          textContentType="password"
          value={password}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        className="-mt-1 mb-5 self-end py-1"
        onPress={() =>
          router.push({
            pathname: '/auth/recover-password',
            params: email ? { email } : undefined,
          })
        }>
        <Text className="text-[14px] font-medium text-[#1F3125]">
          Esqueceu a palavra-passe?
        </Text>
      </Pressable>

      <View>
        <AuthButton
          className="h-[52px]"
          label="Entrar"
          onPress={() => router.replace('/(tabs)/inicio')}
        />
      </View>
    </AuthMinimalScreen>
  );
}
