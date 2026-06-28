import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Button, SearchField } from 'heroui-native';
import { CalendarDays, Trash2, Users } from 'lucide-react-native';
import { View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Text } from 'components/app/Text';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingCourtOptionRow } from 'components/booking/new-booking/NewBookingCourtOptionRow';
import { NewBookingEmptyStateCard } from 'components/booking/new-booking/NewBookingEmptyStateCard';
import { NewBookingGuestOptionRow } from 'components/booking/new-booking/NewBookingGuestOptionRow';
import { NewBookingSheet } from 'components/booking/new-booking/NewBookingSheet';
import type { UserProfile } from 'lib/auth.types';
import type { Court } from 'lib/court.types';
import {
  clampBookableDateKey,
  formatReservationDateLabel,
  getMaxBookableDateKey,
} from 'lib/booking-reservation';
import { getErrorMessage } from 'lib/error-utils';

type NewBookingCourtSheetProps = {
  activeCourts: Court[];
  error: unknown;
  isLoading: boolean;
  onClose: () => void;
  onSelectCourt: (court: Court) => void;
  role?: UserProfile['role'];
  selectedCourtId: string;
  visible: boolean;
};

export function NewBookingCourtSheet({
  activeCourts,
  error,
  isLoading,
  onClose,
  onSelectCourt,
  role,
  selectedCourtId,
  visible,
}: NewBookingCourtSheetProps) {
  return (
    <NewBookingSheet
      enableScroll={false}
      onClose={onClose}
      title="Escolher campo"
      snapPoints={['70%']}
      visible={visible}>
      {isLoading ? (
        <View className="py-10">
          <LoadingIndicator size="small" />
        </View>
      ) : error ? (
        <NewBookingEmptyStateCard
          description={getErrorMessage(error, 'Nao foi possivel carregar os campos.')}
          title="Erro ao carregar"
        />
      ) : (
        <BottomSheetFlatList<Court>
          data={activeCourts}
          keyExtractor={(item: Court) => item.id}
          renderItem={(info: ListRenderItemInfo<Court>) => {
            const { item } = info;

            return (
              <NewBookingCourtOptionRow
                court={item}
                isSelected={item.id === selectedCourtId}
                onPress={() => onSelectCourt(item)}
                role={role}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </NewBookingSheet>
  );
}

type NewBookingGuestSheetProps = {
  error: unknown;
  guestOptions: UserProfile[];
  guestSearchQuery: string;
  isLoading: boolean;
  maxGuestSlots: number;
  onChangeGuestSearchQuery: (value: string) => void;
  onClearGuests: () => void;
  onClose: () => void;
  onToggleGuest: (guest: UserProfile) => void;
  selectedGuests: UserProfile[];
  visible: boolean;
};

export function NewBookingGuestSheet({
  error,
  guestOptions,
  guestSearchQuery,
  isLoading,
  maxGuestSlots,
  onChangeGuestSearchQuery,
  onClearGuests,
  onClose,
  onToggleGuest,
  selectedGuests,
  visible,
}: NewBookingGuestSheetProps) {
  return (
    <NewBookingSheet
      enableScroll={false}
      onClose={onClose}
      title="Convidados"
      visible={visible}
      snapPoints={['80%']}>
      <SearchField className="mb-4" value={guestSearchQuery} onChange={onChangeGuestSearchQuery}>
        <SearchField.Group className="rounded-[20px] bg-[#F1F2F4]">
          <SearchField.SearchIcon iconProps={{ color: '#71727A', size: 18 }} />
          <SearchField.Input
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Nome do membro"
            placeholderColorClassName="text-[#8F9099]"
            variant="secondary"
          />
        </SearchField.Group>
      </SearchField>

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Users size={16} stroke="#BDE111" strokeWidth={2.1} />
          <Text className="ml-2 font-label text-[14px] text-[#666666]">
            {selectedGuests.length}/{maxGuestSlots} convidados
          </Text>
        </View>

        {selectedGuests.length > 0 ? (
          <Button feedbackVariant="none" onPress={onClearGuests} variant="ghost">
            <Trash2 size={20} stroke="red" color="red" strokeWidth={2.1} />
          </Button>
        ) : null}
      </View>

      {isLoading ? (
        <View className="items-center justify-center py-10">
          <LoadingIndicator size="large" />
          <Text className="mt-3 text-center font-label text-[16px] text-[#6D6D6D]">
            A pesquisar.
          </Text>
        </View>
      ) : error ? (
        <NewBookingEmptyStateCard
          description={getErrorMessage(error, 'Nao foi possivel carregar os membros.')}
          title="Erro ao carregar"
        />
      ) : guestOptions.length === 0 ? (
        <NewBookingEmptyStateCard description="Tente outro nome." title="Sem resultados" />
      ) : (
        <BottomSheetFlatList<UserProfile>
          data={guestOptions}
          keyExtractor={(item: UserProfile) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={(info: ListRenderItemInfo<UserProfile>) => {
            const { item } = info;
            const isSelected = selectedGuests.some((guest) => guest.id === item.id);
            const isDisabled = !isSelected && selectedGuests.length >= maxGuestSlots;

            return (
              <NewBookingGuestOptionRow
                guest={item}
                isDisabled={isDisabled}
                isSelected={isSelected}
                onPress={() => onToggleGuest(item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </NewBookingSheet>
  );
}

type NewBookingDateSheetProps = {
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
  selectedDate: string;
  visible: boolean;
};

export function NewBookingDateSheet({
  onClose,
  onSelectDate,
  selectedDate,
  visible,
}: NewBookingDateSheetProps) {
  return (
    <NewBookingSheet onClose={onClose} title="Escolher data" visible={visible} snapPoints={['70%']}>
      <View className="mb-4 flex-row items-center">
        <CalendarDays size={18} stroke="#BDE111" strokeWidth={2.1} />
        <Text className="ml-2 font-label text-[14px] text-[#666666]">
          Ate {formatReservationDateLabel(getMaxBookableDateKey())}
        </Text>
      </View>

      <Calendar
        enableSwipeMonths
        firstDay={1}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#BDE111',
          },
        }}
        maxDate={getMaxBookableDateKey()}
        minDate={clampBookableDateKey()}
        onDayPress={(day) => onSelectDate(clampBookableDateKey(day.dateString))}
        theme={{
          arrowColor: '#BDE111',
          dayTextColor: '#181818',
          monthTextColor: '#181818',
          selectedDayBackgroundColor: '#BDE111',
          selectedDayTextColor: '#181818',
          textDayFontFamily: 'Poppins_400Regular',
          textMonthFontFamily: 'Poppins_600SemiBold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          todayTextColor: '#BDE111',
        }}
      />
    </NewBookingSheet>
  );
}
