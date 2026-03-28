import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { CalendarDays } from 'lucide-react-native';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { CourtImageCarousel } from 'components/court/CourtImageCarousel';
import { useCourtQuery } from 'hooks/useCourtQuery';
import {
  formatCourtCapacity,
  formatCourtLighting,
  formatCourtPrice,
  formatCourtRating,
  formatCourtTypeLabel,
} from 'lib/court-utils';
import { getErrorMessage } from 'lib/error-utils';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-3">
      <Text className="flex-1 text-[13px] font-medium text-[#707070]">{label}</Text>
      <Text className="flex-1 text-right text-[14px] font-semibold leading-6 text-[#171717]">
        {value}
      </Text>
    </View>
  );
}

function CourtDetailsErrorState({ message }: { message: string }) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-[18px] text-[#161616]">
          Nao foi possivel carregar o campo
        </Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#8A8A8A]">{message}</Text>
      </View>
    </SafeAreaView>
  );
}

export function CourtDetailsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const courtId = typeof params.id === 'string' ? params.id : '';
  const courtQuery = useCourtQuery(courtId, {
    enabled: Boolean(courtId),
  });

  if (!courtId) {
    return <CourtDetailsErrorState message="O identificador do campo nao foi encontrado." />;
  }

  if (courtQuery.isPending) {
    return <AppScreenLoader message="A carregar detalhes do campo..." />;
  }

  if (courtQuery.isError || !courtQuery.data) {
    return (
      <CourtDetailsErrorState
        message={getErrorMessage(courtQuery.error, 'Tenta novamente dentro de alguns instantes.')}
      />
    );
  }

  const court = courtQuery.data;
  const contentWidth = Math.max(width - 40, 280);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: court.name,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}>
        <CourtImageCarousel
          height={360}
          images={court.images}
          label={formatCourtTypeLabel(court.type)}
          width={contentWidth}
        />

        <View className="pt-6">
          <Text className="text-[34px] text-[#161616]">{court.name}</Text>
          <Text className="mt-3 text-[16px] leading-7 text-[#8A8A8A]">
            {court.surface} • {formatCourtRating(court.ratingAverage, court.ratingCount)}
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-[34px] text-[#161616]">
            {formatCourtPrice(court.pricePerHour, court.currency)}
          </Text>
          <Text className="mt-1 text-[15px] text-[#9A9A9A]">por hora</Text>
        </View>

        <View className="mt-8 gap-1">
          <DetailRow label="Tipo" value={formatCourtTypeLabel(court.type)} />
          <DetailRow label="Piso" value={court.surface} />
          <DetailRow label="Capacidade" value={formatCourtCapacity(court.maxPlayers)} />
          <DetailRow label="Iluminacao" value={formatCourtLighting(court.hasLighting)} />
        </View>

        <View className="mt-8">
          <Text className="text-[18px] text-[#161616]">Regras</Text>
          <Text className="mt-3 text-[15px] leading-7 text-[#8A8A8A]">
            {court.rules?.trim()
              ? court.rules
              : 'Sem regras adicionais registadas para este campo.'}
          </Text>
        </View>

        <Button
          className="mt-5 h-14 rounded-2xl bg-primary"
          feedbackVariant="none"
          onPress={() =>
            router.push({
              pathname: '/bookings/new',
              params: { courtId: court.id },
            })
          }>
          <CalendarDays size={18} stroke="black" strokeWidth={2} />
          <Button.Label className="text-black">Reservar</Button.Label>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
