import { useEffect, useState } from 'react';

import { BottomSheet, Button } from 'heroui-native';
import { CreditCard, Smartphone } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from 'components/app/Text';
import { TextInput } from 'components/app/TextInput';
import { NewBookingInstructionRow } from 'components/booking/new-booking/NewBookingInstructionRow';
import type { OnlinePaymentMethod } from 'lib/booking-pricing';

interface WalletTopUpSheetProps {
  apiErrorMessage?: string;
  isLoading?: boolean;
  onClose: () => void;
  onResetError?: () => void;
  onSubmit: (payload: { amount: number; paymentMethod: OnlinePaymentMethod }) => void;
  visible: boolean;
}

export function WalletTopUpSheet({
  apiErrorMessage,
  isLoading = false,
  onClose,
  onResetError,
  onSubmit,
  visible,
}: WalletTopUpSheetProps) {
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OnlinePaymentMethod>('MPESA');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmount('');
    setFormError('');
    setPaymentMethod('MPESA');
  }, [visible]);

  const normalizedAmount = Number(amount.replace(/\s/g, '').replace(',', '.'));
  const canSubmit = Number.isFinite(normalizedAmount) && normalizedAmount > 0 && !isLoading;
  const errorMessage = formError || apiErrorMessage;

  function handleSubmit() {
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormError('Introduza um valor maior que zero.');
      return;
    }

    setFormError('');
    onSubmit({
      amount: Number(normalizedAmount.toFixed(2)),
      paymentMethod,
    });
  }

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onClose();
        }
      }}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay style={{ backgroundColor: 'rgba(17, 17, 17, 0.3)' }} />
        <BottomSheet.Content
          android_keyboardInputMode="adjustResize"
          backgroundClassName="rounded-t-[32px] bg-white"
          contentContainerClassName="px-6 pb-10 pt-2"
          enableDynamicSizing
          snapPoints={['80%']}
          handleIndicatorClassName="bg-[#D9D9DD]"
          keyboardBehavior="interactive">
          <View className="mb-5 flex-row items-center justify-between">
            <BottomSheet.Title className="text-[20px] font-semibold text-[#111111]">
              Recarregar carteira
            </BottomSheet.Title>
            <BottomSheet.Close
              className="bg-[#F4F4F6]"
              iconProps={{ color: '#181818', size: 20 }}
            />
          </View>

          <Text className="mb-2 text-[16px] text-[#202020]">Valor</Text>
          <TextInput
            className="h-[58px] rounded-2xl border border-[#D8D8DE] bg-white px-4 text-[16px] text-[#171717]"
            editable={!isLoading}
            keyboardType="decimal-pad"
            onChangeText={(value) => {
              setAmount(value);
              onResetError?.();
              if (formError) {
                setFormError('');
              }
            }}
            placeholder="Ex: 1000"
            value={amount}
          />

          <Text className="mt-6 text-[16px] text-[#202020]">Método de pagamento</Text>
          <View>
            <NewBookingInstructionRow
              icon={Smartphone}
              isSelected={paymentMethod === 'MPESA'}
              label="M-Pesa"
              onPress={() => {
                setPaymentMethod('MPESA');
                onResetError?.();
              }}
            />
            <NewBookingInstructionRow
              icon={Smartphone}
              isSelected={paymentMethod === 'EMOLA'}
              label="E-Mola"
              onPress={() => {
                setPaymentMethod('EMOLA');
                onResetError?.();
              }}
            />
            <NewBookingInstructionRow
              icon={CreditCard}
              isSelected={paymentMethod === 'CARD'}
              label="Cartao Bancario"
              onPress={() => {
                setPaymentMethod('CARD');
                onResetError?.();
              }}
              showDivider={false}
            />
          </View>

          {errorMessage ? (
            <Text className="mt-4 text-[14px] leading-5 text-[#D05B5B]">{errorMessage}</Text>
          ) : (
            <Text className="mt-4 text-[14px] leading-5 text-[#7A7A7A]">
              Vamos abrir o pagamento para confirmares.
            </Text>
          )}

          <Button
            className={`mt-6 h-[56px] rounded-full ${canSubmit ? 'bg-primary' : 'bg-[#C9CDC8]'}`}
            feedbackVariant="none"
            isDisabled={!canSubmit}
            onPress={handleSubmit}>
            <Button.Label className="font-button text-[16px] text-black">
              {isLoading ? 'A preparar...' : 'Continuar'}
            </Button.Label>
          </Button>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
