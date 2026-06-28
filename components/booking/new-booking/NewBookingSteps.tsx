import type { Dispatch, SetStateAction } from 'react';
import { Button } from 'heroui-native';
import { Lightbulb, LightbulbOff, Phone, Smartphone, Users, Wallet } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from 'components/app/Text';
import { TextInput } from 'components/app/TextInput';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingEmptyStateCard } from 'components/booking/new-booking/NewBookingEmptyStateCard';
import { NewBookingField } from 'components/booking/new-booking/NewBookingField';
import { NewBookingInstructionRow } from 'components/booking/new-booking/NewBookingInstructionRow';
import { NewBookingSelectedGuestChip } from 'components/booking/new-booking/NewBookingSelectedGuestChip';
import { NewBookingSummaryCard } from 'components/booking/new-booking/NewBookingSummaryCard';
import { NewBookingTimeSlotRow } from 'components/booking/new-booking/NewBookingTimeSlotRow';
import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import type { UserProfile } from 'lib/auth.types';
import type { BookingPaymentMethod } from 'lib/booking-pricing';
import { formatReservationDateLabel, SLOT_DURATION_MINUTES } from 'lib/booking-reservation';
import type { Court } from 'lib/court.types';
import { formatCourtPrice } from 'lib/court-utils';

type NewBookingScheduleStepProps = {
  availabilityError: string;
  canUseLighting: boolean;
  isAvailabilityLoading: boolean;
  lightingRequested: boolean;
  onOpenDateSheet: () => void;
  onRetryAvailability: () => void;
  onSelectSlot: (slot: SelectableTimeSlot) => void;
  onChangeLightingRequested: (value: boolean) => void;
  remainingDailyMinutes: number;
  selectableSlots: SelectableTimeSlot[];
  selectedCourt: Court | null;
  selectedDate: string;
};

export function NewBookingScheduleStep({
  availabilityError,
  canUseLighting,
  isAvailabilityLoading,
  lightingRequested,
  onOpenDateSheet,
  onRetryAvailability,
  onSelectSlot,
  onChangeLightingRequested,
  remainingDailyMinutes,
  selectableSlots,
  selectedCourt,
  selectedDate,
}: NewBookingScheduleStepProps) {
  return (
    <>
      <NewBookingField
        label="Data"
        onPress={onOpenDateSheet}
        placeholder="dd / mm / aaaa"
        required
        value={formatReservationDateLabel(selectedDate)}
      />

      <View className="mb-4 rounded-2xl bg-[#F7F7F8] px-4 py-3">
        <Text className="font-label text-[17px] text-[#202020]">Escolha 1 ou 2 horas</Text>
        <Text className="mt-1 font-label text-[14px] text-[#6D6D6D]">
          Restam {remainingDailyMinutes} min neste dia
        </Text>
      </View>

      {selectedCourt ? (
        <View className="mb-4 rounded-2xl border border-[#ECECEC] bg-white px-4">
          <NewBookingInstructionRow
            icon={LightbulbOff}
            isSelected={!lightingRequested}
            label="Sem iluminacao"
            onPress={() => onChangeLightingRequested(false)}
            showDivider
          />
          <NewBookingInstructionRow
            description={
              canUseLighting
                ? `+${formatCourtPrice(
                    selectedCourt.lightingPricePerHour,
                    selectedCourt.currency
                  )}/hora`
                : 'Este campo nao tem iluminacao disponivel para reserva.'
            }
            icon={Lightbulb}
            isDisabled={!canUseLighting}
            isSelected={lightingRequested && canUseLighting}
            label="Com iluminacao"
            onPress={() => onChangeLightingRequested(true)}
            showDivider={false}
          />
        </View>
      ) : null}

      {!selectedCourt ? (
        <NewBookingEmptyStateCard
          description="Volta ao passo anterior e escolhe uma quadra."
          title="Quadra em falta"
        />
      ) : isAvailabilityLoading ? (
        <View className="items-center rounded-2xl border border-[#ECECEC] bg-white px-5 py-10">
          <LoadingIndicator size="small" />
          <Text className="mt-3 text-center font-label text-[16px] text-[#6D6D6D]">
            A verificar horarios.
          </Text>
        </View>
      ) : availabilityError ? (
        <View className="rounded-2xl border border-[#F5D6D4] bg-[#FFF8F7] px-5 py-5">
          <Text className="font-title text-[18px] text-[#171717]">Erro nos horarios</Text>
          <Text className="mt-2 font-label text-[14px] leading-5 text-[#7C6F6F]">
            {availabilityError}
          </Text>
          <Button
            className="mt-4 self-start rounded-full bg-[#BDE111] px-4"
            feedbackVariant="none"
            onPress={onRetryAvailability}>
            <Button.Label className="font-button text-[14px] text-white">
              Tentar novamente
            </Button.Label>
          </Button>
        </View>
      ) : remainingDailyMinutes < SLOT_DURATION_MINUTES ? (
        <NewBookingEmptyStateCard
          description="Ja atingiste o limite de 2 horas de reserva para esta data."
          title="Limite diario atingido"
        />
      ) : selectableSlots.every((slot) => slot.isDisabled) ? (
        <NewBookingEmptyStateCard
          description="Nao existem horarios livres para esta quadra na data escolhida."
          title="Sem disponibilidade"
        />
      ) : (
        <View className="rounded-2xl border border-[#ECECEC] bg-white px-4">
          {selectableSlots.map((slot, index) => (
            <NewBookingTimeSlotRow
              key={slot.key}
              onPress={() => onSelectSlot(slot)}
              showDivider={index < selectableSlots.length - 1}
              slot={slot}
            />
          ))}
        </View>
      )}
    </>
  );
}

type NewBookingGuestsStepProps = {
  onOpenGuestSheet: () => void;
  onRemoveGuest: (guestId: string) => void;
  selectedGuests: UserProfile[];
};

export function NewBookingGuestsStep({
  onOpenGuestSheet,
  onRemoveGuest,
  selectedGuests,
}: NewBookingGuestsStepProps) {
  return (
    <>
      <NewBookingField
        label="Convidados"
        onPress={onOpenGuestSheet}
        placeholder="Adicionar pessoa"
        value={
          selectedGuests.length
            ? `${selectedGuests.length} convidado${selectedGuests.length > 1 ? 's' : ''} selecionado${selectedGuests.length > 1 ? 's' : ''}`
            : undefined
        }
      />

      {selectedGuests.length > 0 ? (
        <View className="mb-4 flex-row flex-wrap">
          {selectedGuests.map((guest) => (
            <NewBookingSelectedGuestChip key={guest.id} guest={guest} onRemove={onRemoveGuest} />
          ))}
        </View>
      ) : null}
    </>
  );
}

type NewBookingPaymentStepProps = {
  hasEnoughWalletBalance: boolean;
  paymentMethod: BookingPaymentMethod;
  phone: string;
  phoneError: string;
  setPaymentMethod: Dispatch<SetStateAction<BookingPaymentMethod>>;
  setPhone: Dispatch<SetStateAction<string>>;
  setPhoneError: Dispatch<SetStateAction<string>>;
  setSubmissionError: Dispatch<SetStateAction<string>>;
  walletBalance: number;
  walletCurrency: string;
  walletIsLoading: boolean;
};

export function NewBookingPaymentStep({
  hasEnoughWalletBalance,
  paymentMethod,
  phone,
  phoneError,
  setPaymentMethod,
  setPhone,
  setPhoneError,
  setSubmissionError,
  walletBalance,
  walletCurrency,
  walletIsLoading,
}: NewBookingPaymentStepProps) {
  return (
    <View>
      <View className="mb-5 rounded-2xl border border-[#ECECEC] bg-white px-4">
        <NewBookingInstructionRow
          description="PIN no telemovel"
          icon={Smartphone}
          isSelected={paymentMethod === 'MPESA'}
          label="M-Pesa"
          onPress={() => {
            setPaymentMethod('MPESA');
            setSubmissionError('');
          }}
          showDivider
        />
        <NewBookingInstructionRow
          description={`Disponivel: ${formatCourtPrice(walletBalance, walletCurrency)}`}
          icon={Wallet}
          isDisabled={walletIsLoading || !hasEnoughWalletBalance}
          isSelected={paymentMethod === 'CLUB_BALANCE'}
          label="Saldo do clube"
          onPress={() => {
            if (hasEnoughWalletBalance) {
              setPaymentMethod('CLUB_BALANCE');
              setPhoneError('');
              setSubmissionError('');
            }
          }}
          showDivider={false}
        />
      </View>

      {paymentMethod === 'MPESA' ? (
        <>
          <Text className="mb-2 font-label text-[16px] text-[#202020]">Numero M-Pesa</Text>
          <TextInput
            autoComplete="tel"
            className={`h-[60px] rounded-2xl border bg-white px-4 font-input text-[16px] text-[#171717] ${
              phoneError ? 'border-[#D05B5B]' : 'border-[#D8D8DE]'
            }`}
            keyboardType="phone-pad"
            maxLength={15}
            onChangeText={(value) => {
              setPhone(value);
              if (phoneError) {
                setPhoneError('');
              }
            }}
            placeholder="84 123 4567"
            textContentType="telephoneNumber"
            value={phone}
          />
          {phoneError ? (
            <Text className="mt-2 font-label text-[14px] leading-5 text-[#D05B5B]">
              {phoneError}
            </Text>
          ) : null}
          <Text className="mt-3 font-label text-[14px] leading-5 text-[#7A7A7A]">
            Numero Vodacom para pagar.
          </Text>
        </>
      ) : null}

      {paymentMethod === 'CLUB_BALANCE' && !hasEnoughWalletBalance ? (
        <Text className="font-label text-[14px] leading-5 text-[#D05B5B]">
          Saldo do clube insuficiente para esta reserva.
        </Text>
      ) : null}
    </View>
  );
}

type NewBookingSummaryStepProps = {
  lightingRequested: boolean;
  paymentMethod: BookingPaymentMethod;
  phone: string;
  selectedCourt: Court | null;
  selectedDate: string;
  selectedGuests: UserProfile[];
  selectedRangeLabel: string;
  submissionError: string;
  walletBalance: number;
  walletCurrency: string;
};

export function NewBookingSummaryStep({
  lightingRequested,
  paymentMethod,
  phone,
  selectedCourt,
  selectedDate,
  selectedGuests,
  selectedRangeLabel,
  submissionError,
  walletBalance,
  walletCurrency,
}: NewBookingSummaryStepProps) {
  return (
    <>
      {selectedCourt && selectedRangeLabel ? (
        <NewBookingSummaryCard
          court={selectedCourt}
          dateKey={selectedDate}
          rangeLabel={selectedRangeLabel}
        />
      ) : (
        <NewBookingEmptyStateCard
          description="Completa os passos anteriores para rever o resumo."
          title="Resumo indisponivel"
        />
      )}

      <View className="mt-4 rounded-2xl border border-[#ECECEC] bg-white px-4">
        <NewBookingInstructionRow
          description={
            paymentMethod === 'CLUB_BALANCE'
              ? `Saldo disponivel: ${formatCourtPrice(walletBalance, walletCurrency)}`
              : phone.trim() || 'Numero em falta'
          }
          icon={paymentMethod === 'CLUB_BALANCE' ? Wallet : Phone}
          label={paymentMethod === 'CLUB_BALANCE' ? 'Saldo do clube' : 'Numero de pagamento'}
          showDivider
        />
        <NewBookingInstructionRow
          description={lightingRequested ? 'Com iluminacao' : 'Sem iluminacao'}
          icon={Lightbulb}
          label="Iluminacao"
          showDivider
        />
        <NewBookingInstructionRow
          description={
            selectedGuests.length
              ? `${selectedGuests.length} convidado${selectedGuests.length > 1 ? 's' : ''}`
              : 'Sem convidados'
          }
          icon={Users}
          label="Participantes"
          showDivider={false}
        />
      </View>

      {submissionError ? (
        <Text className="mt-4 font-label text-[14px] leading-5 text-[#D05B5B]">
          {submissionError}
        </Text>
      ) : null}
    </>
  );
}
