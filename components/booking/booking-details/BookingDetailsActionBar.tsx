import { Button } from 'heroui-native';
import { View } from 'react-native';

import { Text } from 'components/app/Text';

interface BookingDetailsActionBarProps {
  actionError: string;
  canCancelBooking: boolean;
  canExtendBooking: boolean;
  canPerformCheckIn: boolean;
  canRespondToInvitation: boolean;
  extensionUnavailableReason?: string | null;
  isAcceptInvitationPending: boolean;
  isCancelingBooking: boolean;
  isCheckingIn: boolean;
  isCheckInTime: boolean;
  isDeclineInvitationPending: boolean;
  isExtendingBooking: boolean;
  isInvitationPending: boolean;
  onAcceptInvitation: () => void;
  onCancelBooking: () => void;
  onCheckIn: () => void;
  onDeclineInvitation: () => void;
  onExtendBooking: () => void;
  showExtensionUnavailableHint: boolean;
}

export function BookingDetailsActionBar({
  actionError,
  canCancelBooking,
  canExtendBooking,
  canPerformCheckIn,
  canRespondToInvitation,
  extensionUnavailableReason,
  isAcceptInvitationPending,
  isCancelingBooking,
  isCheckingIn,
  isCheckInTime,
  isDeclineInvitationPending,
  isExtendingBooking,
  isInvitationPending,
  onAcceptInvitation,
  onCancelBooking,
  onCheckIn,
  onDeclineInvitation,
  onExtendBooking,
  showExtensionUnavailableHint,
}: BookingDetailsActionBarProps) {
  const isVisible =
    canRespondToInvitation ||
    canCancelBooking ||
    canPerformCheckIn ||
    canExtendBooking ||
    showExtensionUnavailableHint;

  if (!isVisible) {
    return null;
  }

  return (
    <View className="mt-6 border-t border-[#F0F0F0] pt-4">
      {actionError ? (
        <Text className="mb-3 text-[13px] leading-5 text-[#C14A3D]">{actionError}</Text>
      ) : null}

      {canRespondToInvitation ? (
        <View className="flex-row gap-3">
          <Button
            className="h-14 flex-1 rounded-[20px] border border-[#ECECEC] bg-white"
            feedbackVariant="none"
            isDisabled={isInvitationPending}
            onPress={onDeclineInvitation}
            variant="secondary">
            <Button.Label className="font-button text-[14px] text-[#232323]">
              {isDeclineInvitationPending ? 'A negar...' : 'Negar'}
            </Button.Label>
          </Button>

          <Button
            className="h-14 flex-1 rounded-[20px] bg-primary"
            feedbackVariant="none"
            isDisabled={isInvitationPending}
            onPress={onAcceptInvitation}>
            <Button.Label className="font-button text-[14px] text-white">
              {isAcceptInvitationPending ? 'A aceitar...' : 'Aceitar convite'}
            </Button.Label>
          </Button>
        </View>
      ) : canPerformCheckIn ? (
        <View className="gap-3">
          <Button
            className="h-14 rounded-[20px] bg-primary"
            feedbackVariant="none"
            isDisabled={!isCheckInTime || isCheckingIn}
            onPress={onCheckIn}>
            <Button.Label className="font-button text-[14px] text-white">
              {isCheckingIn ? 'A fazer check-in...' : 'Fazer check-in'}
            </Button.Label>
          </Button>

          {!isCheckInTime ? (
            <Text className="text-center text-[13px] leading-5 text-[#7A7A7A]">
              O check-in fica disponível à hora do campo marcado.
            </Text>
          ) : null}

          {canExtendBooking ? (
            <ExtendButton
              className="bg-primary"
              isLoading={isExtendingBooking}
              onPress={onExtendBooking}
            />
          ) : null}

          {canCancelBooking ? (
            <CancelButton isLoading={isCancelingBooking} onPress={onCancelBooking} />
          ) : null}
        </View>
      ) : canExtendBooking ? (
        <ExtendButton isLoading={isExtendingBooking} onPress={onExtendBooking} />
      ) : canCancelBooking ? (
        <CancelButton isLoading={isCancelingBooking} onPress={onCancelBooking} />
      ) : showExtensionUnavailableHint ? (
        <Text className="text-center text-[13px] leading-5 text-[#7A7A7A]">
          {extensionUnavailableReason === 'booking.error.extensionSlotOccupied'
            ? 'A proxima hora ja esta ocupada neste campo.'
            : 'A extensao de +1 hora nao esta disponivel neste momento.'}
        </Text>
      ) : null}
    </View>
  );
}

function ExtendButton({
  className = 'bg-[#BDE111]',
  isLoading,
  onPress,
}: {
  className?: string;
  isLoading: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className={`h-14 rounded-[20px] ${className}`}
      feedbackVariant="none"
      isDisabled={isLoading}
      onPress={onPress}>
      <Button.Label className="font-button text-[14px] text-white">
        {isLoading ? 'A prolongar...' : 'Prolongar +1 hora'}
      </Button.Label>
    </Button>
  );
}

function CancelButton({ isLoading, onPress }: { isLoading: boolean; onPress: () => void }) {
  return (
    <Button
      className="h-14 rounded-[20px] bg-[#FCE8E6]"
      feedbackVariant="none"
      isDisabled={isLoading}
      onPress={onPress}
      variant="secondary">
      <Button.Label className="font-button text-[14px] text-[#C54D4D]">
        {isLoading ? 'A cancelar...' : 'Cancelar reserva'}
      </Button.Label>
    </Button>
  );
}
