import { useRouter } from 'expo-router';
import { UserRoundPlus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CriarContaScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F6F5F1]">
      <View className="flex-1 px-6 py-6">
        <View className="rounded-[28px] bg-white p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4EF]">
            <UserRoundPlus size={24} stroke="#1F3125" strokeWidth={2.2} />
          </View>

          <Text className="mt-6 text-[28px] font-bold text-[#141414]">
            Criar conta
          </Text>
          <Text className="mt-3 text-[16px] leading-6 text-[#666666]">
            A tela de cadastro ainda nao foi implementada neste projeto. Este
            placeholder deixa o fluxo de entrada navegavel desde a primeira
            sessao.
          </Text>
        </View>

        <View className="mt-6 gap-3">
          <Pressable
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded-full bg-[#1F3125]"
            onPress={() => router.replace('/(tabs)/inicio')}>
            <Text className="text-[16px] font-semibold text-white">
              Entrar no app
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded-full bg-white"
            onPress={() => router.back()}>
            <Text className="text-[16px] font-semibold text-[#121212]">
              Voltar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
