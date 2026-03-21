import { Text, View } from 'react-native';

import { WelcomeActionButton } from './WelcomeActionButton';

interface WelcomeContentProps {
  onCreateAccount: () => void;
  onEnter: () => void;
}

export function WelcomeContent({
  onCreateAccount,
  onEnter,
}: WelcomeContentProps) {
  return (
    <View className="bg-white px-9 pb-10 pt-5">
      <Text className="text-center text-[26px] font-bold leading-[34px] tracking-[-0.8px] text-[#0E0E0E]">
        Seja bem-vindo ao{'\n'}Clube de Ténis de Maputo
      </Text>

      <View className="mt-11">
        <WelcomeActionButton label="Entrar" onPress={onEnter} />
        <WelcomeActionButton
          label="Criar conta"
          onPress={onCreateAccount}
          variant="secondary"
        />
      </View>
    </View>
  );
}
