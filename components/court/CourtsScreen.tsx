import { Button, Card } from 'heroui-native';
import { CircleAlert, Club } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import { CourtHorizontalCard } from 'components/court/CourtHorizontalCard';
import { useCourtsQuery } from 'hooks/useCourtsQuery';
import { getErrorMessage } from 'lib/error-utils';

function CourtsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="rounded-[28px] bg-white p-6">
      <Card.Body className="items-center">
        <View className="rounded-full bg-[#FFF4E8] p-3">
          <CircleAlert size={24} stroke="#C96A1B" strokeWidth={2} />
        </View>

        <Card.Title className="mt-4 text-center text-[18px] text-[#171717]">
          Nao foi possivel carregar os campos
        </Card.Title>
        <Card.Description className="mt-2 text-center text-[14px] leading-6 text-[#787878]">
          {message}
        </Card.Description>
      </Card.Body>

      <Card.Footer className="pt-5">
        <Button className="w-full" feedbackVariant="scale" onPress={onRetry}>
          Tentar novamente
        </Button>
      </Card.Footer>
    </Card>
  );
}

function CourtsEmptyState() {
  return (
    <Card className="rounded-[28px] bg-white p-6">
      <Card.Body className="items-center">
        <View className="rounded-full bg-[#EEF5ED] p-3">
          <Club size={24} stroke="#1F3125" strokeWidth={2} />
        </View>

        <Card.Title className="mt-4 text-center text-[18px] text-[#171717]">
          Nenhum campo disponivel
        </Card.Title>
        <Card.Description className="mt-2 text-center text-[14px] leading-6 text-[#787878]">
          Quando existirem campos ativos, eles vao aparecer aqui com os dados principais.
        </Card.Description>
      </Card.Body>
    </Card>
  );
}

export function CourtsScreen() {
  const courtsQuery = useCourtsQuery();

  if (courtsQuery.isPending) {
    return <AppScreenLoader message="A carregar campos..." />;
  }

  const courts = courtsQuery.data ?? [];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        data={courts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          courtsQuery.isError ? (
            <CourtsErrorState
              message={getErrorMessage(
                courtsQuery.error,
                'Tenta novamente dentro de alguns instantes.'
              )}
              onRetry={() => void courtsQuery.refetch()}
            />
          ) : (
            <CourtsEmptyState />
          )
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => <CourtHorizontalCard court={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
