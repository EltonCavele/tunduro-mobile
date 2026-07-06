import type { Dispatch, SetStateAction } from 'react';
import { Button } from 'heroui-native';
import {
  CreditCard,
  Lightbulb,
  LightbulbOff,
  Smartphone,
  Users,
  Wallet,
} from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from 'components/app/Text';
import { LoadingIndicator } from 'components/app/LoadingIndicator';
import { NewBookingEmptyStateCard } from 'components/booking/new-booking/NewBookingEmptyStateCard';
import { NewBookingField } from 'components/booking/new-booking/NewBookingField';
import { NewBookingInstructionRow } from 'components/booking/new-booking/NewBookingInstructionRow';
import { NewBookingSelectedGuestChip } from 'components/booking/new-booking/NewBookingSelectedGuestChip';
import { NewBookingSummaryCard } from 'components/booking/new-booking/NewBookingSummaryCard';
import { NewBookingTimeSlotRow } from 'components/booking/new-booking/NewBookingTimeSlotRow';
import type { SelectableTimeSlot } from 'components/booking/new-booking/shared';
import { BOOKING_PAYMENT_METHOD_LABELS, type BookingPaymentMethod } from 'lib/booking-pricing';
import { formatReservationDateLabel, SLOT_DURATION_MINUTES } from 'lib/booking-reservation';
import type { Court } from 'lib/court.types';
import { formatCourtPrice } from 'lib/court-utils';
import type { UserContact } from 'services/user.service';

type NewBookingDateStepProps = {
  onOpenDateSheet: () => void;
  selectedDate: string;
};

export function NewBookingDateStep({ onOpenDateSheet, selectedDate }: NewBookingDateStepProps) {
  return (
    <NewBookingField
      label="Data"
      onPress={onOpenDateSheet}
      placeholder="dd / mm / aaaa"
      required
      value={formatReservationDateLabel(selectedDate)}
    />
  );
}

type NewBookingTimeStepProps = {
  availabilityError: string;
  isAvailabilityLoading: boolean;
  onRetryAvailability: () => void;
  onSelectSlot: (slot: SelectableTimeSlot) => void;
  remainingDailyMinutes: number;
  selectableSlots: SelectableTimeSlot[];
  selectedCourt: Court | null;
};

export function NewBookingTimeStep({
  availabilityError,
  isAvailabilityLoading,
  onRetryAvailability,
  onSelectSlot,
  remainingDailyMinutes,
  selectableSlots,
  selectedCourt,
}: NewBookingTimeStepProps) {
  return (
    <>
      <View className="mb-4 rounded-2xl bg-[#F7F7F8] px-4 py-3">
        <Text className="font-label text-[17px] text-[#202020]">Escolha 1 ou 2 horas</Text>
        <Text className="mt-1 font-label text-[14px] text-[#6D6D6D]">
          Restam {remainingDailyMinutes} min neste dia
        </Text>
      </View>

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
        <View className="bg-white px-4">
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

type NewBookingLightingStepProps = {
  canUseLighting: boolean;
  lightingRequested: boolean;
  onChangeLightingRequested: (value: boolean) => void;
  selectedCourt: Court | null;
};

export function NewBookingLightingStep({
  canUseLighting,
  lightingRequested,
  onChangeLightingRequested,
  selectedCourt,
}: NewBookingLightingStepProps) {
  if (!selectedCourt) {
    return (
      <NewBookingEmptyStateCard
        description="Volta ao passo anterior e escolhe uma quadra."
        title="Quadra em falta"
      />
    );
  }

  return (
    <View className=" bg-white">
      <NewBookingInstructionRow
        icon={LightbulbOff}
        isSelected={!lightingRequested}
        label="Sem iluminacao"
        onPress={() => onChangeLightingRequested(false)}
        showDivider={false}
      />
      <NewBookingInstructionRow
        description={
          canUseLighting
            ? `+${formatCourtPrice(selectedCourt.lightingPricePerHour, selectedCourt.currency)}/hora`
            : 'Este campo nao tem iluminacao.'
        }
        icon={Lightbulb}
        isDisabled={!canUseLighting}
        isSelected={lightingRequested && canUseLighting}
        label="Com iluminacao"
        onPress={() => onChangeLightingRequested(true)}
        showDivider={false}
      />
    </View>
  );
}

type NewBookingGuestsStepProps = {
  onOpenGuestSheet: () => void;
  onRemoveGuest: (guestId: string) => void;
  selectedGuests: UserContact[];
};

export function NewBookingGuestsStep({
  onOpenGuestSheet,
  onRemoveGuest,
  selectedGuests,
}: NewBookingGuestsStepProps) {
  return (
    <>
      <NewBookingField
        label="Convidados (opcional)"
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
  setPaymentMethod: Dispatch<SetStateAction<BookingPaymentMethod>>;
  setSubmissionError: Dispatch<SetStateAction<string>>;
  walletBalance: number;
  walletCurrency: string;
  walletIsLoading: boolean;
};

export function NewBookingPaymentStep({
  hasEnoughWalletBalance,
  paymentMethod,
  setPaymentMethod,
  setSubmissionError,
  walletBalance,
  walletCurrency,
  walletIsLoading,
}: NewBookingPaymentStepProps) {
  return (
    <View>
      <View className="mb-5 rounded-2xl  border-[#ECECEC] bg-white">
        <NewBookingInstructionRow
          icon={Smartphone}
          isSelected={paymentMethod === 'MPESA'}
          label="M-Pesa"
          onPress={() => {
            setPaymentMethod('MPESA');
            setSubmissionError('');
          }}
          showDivider={false}
        />
        <NewBookingInstructionRow
          icon={Smartphone}
          isSelected={paymentMethod === 'EMOLA'}
          label="E-Mola"
          onPress={() => {
            setPaymentMethod('EMOLA');
            setSubmissionError('');
          }}
          showDivider={false}
        />
        <NewBookingInstructionRow
          icon={CreditCard}
          isDisabled={false}
          isSelected={paymentMethod === 'CARD'}
          label="Cartao Bancario"
          onPress={() => {
            setPaymentMethod('CARD');
            setSubmissionError('');
          }}
          showDivider={false}
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
              setSubmissionError('');
            }
          }}
          showDivider={false}
        />
      </View>

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
  selectedCourt: Court | null;
  selectedDate: string;
  selectedGuests: UserContact[];
  selectedRangeLabel: string;
  submissionError: string;
  walletBalance: number;
  walletCurrency: string;
};

export function NewBookingSummaryStep({
  lightingRequested,
  paymentMethod,
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

      <View className="mt-4  bg-white">
        <NewBookingInstructionRow
          description={
            paymentMethod === 'CLUB_BALANCE'
              ? `Saldo disponivel: ${formatCourtPrice(walletBalance, walletCurrency)}`
              : 'Checkout online'
          }
          icon={
            paymentMethod === 'CLUB_BALANCE'
              ? Wallet
              : paymentMethod === 'CARD'
                ? CreditCard
                : Smartphone
          }
          label={BOOKING_PAYMENT_METHOD_LABELS[paymentMethod]}
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
