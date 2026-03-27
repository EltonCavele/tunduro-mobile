import { Pressable, ScrollView, Text, View } from 'react-native';

import { SafeAreaView } from 'components/app/SafeAreaView';
import { HomeHeader } from './HomeHeader';

import { UpcomingMatchCard } from './UpcomingMatchCard';

import { Plus } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native/icons';

export function HomeScreen() {
  return (
    <SafeAreaView edges={['right', 'left', 'top']} className="flex-1 bg-white">
      <View className="px-6 pb-4 pt-1">
        <HomeHeader />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 gap-3 "
        showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-[13px] text-[#555555]">Seja bem-vindo de volta!</Text>
          <Text className="text-[18px] font-medium">Pronto para o próximo jogo?</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className=" bg-primary  mt-4 flex-row items-center justify-center rounded-2xl px-8 py-4">
          <View className="mr-4">
            <Plus stroke="white" />
          </View>
          <Text className="text-[17px] font-medium text-white">Reservar uma quadra</Text>
        </Pressable>

        <View className=" mt-4 flex flex-row items-center justify-between">
          <Text className="text-[18px] font-semibold">Proxima partida</Text>
          <View className="flex flex-row items-center">
            <Text className="text-[15px] text-gray-500">Ver agenda</Text>
            <ChevronRight stroke="gray" />
          </View>
        </View>

        <UpcomingMatchCard
          dayLabel="Hoje"
          timeLabel="16h:30m"
          courtLabel="Quadra"
          courtName="Campo 1"
          opponentName="Armando Simango"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
