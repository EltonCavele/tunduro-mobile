import { useEffect, useState } from 'react';

import { BottomSheet, Button } from 'heroui-native';
import { View } from 'react-native';

import { Text } from 'components/app/Text';
import { TextInput } from 'components/app/TextInput';

interface WalletTopUpSheetProps {
  apiErrorMessage?: string;
  initialPhone?: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onResetError?: () => void;
  onSubmit: (payload: { amount: number; phone: string }) => void;
  visible: boolean;
}

const MOZ_MSISDN_REGEX = /^(\+?258)?\s?(8[2-7])\s?\d{3}\s?\d{4}$|^(8[2-7])\d{7}$/;

export function WalletTopUpSheet({
  apiErrorMessage,
  initialPhone,
  isLoading = false,
  onClose,
  onResetError,
  onSubmit,
  visible,
}: WalletTopUpSheetProps) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(initialPhone?.trim() ?? '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmount('');
    setPhone(initialPhone?.trim() ?? '');
    setFormError('');
  }, [initialPhone, visible]);

  const normalizedAmount = Number(amount.replace(/\s/g, '').replace(',', '.'));
  const canSubmit =
    Number.isFinite(normalizedAmount) &&
    normalizedAmount > 0 &&
    MOZ_MSISDN_REGEX.test(phone.trim()) &&
    !isLoading;
  const errorMessage = formError || apiErrorMessage;

  function handleSubmit() {
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormError('Introduza um valor maior que zero.');
      return;
    }

    if (!MOZ_MSISDN_REGEX.test(phone.trim())) {
      setFormError('Introduza um numero Vodacom valido.');
      return;
    }

    setFormError('');
    onSubmit({
      amount: Number(normalizedAmount.toFixed(2)),
      phone: phone.trim(),
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

          <Text className="mb-2 mt-5 text-[16px] text-[#202020]">Numero M-Pesa</Text>
          <TextInput
            autoComplete="tel"
            className="h-[58px] rounded-2xl border border-[#D8D8DE] bg-white px-4 text-[16px] text-[#171717]"
            editable={!isLoading}
            keyboardType="phone-pad"
            maxLength={15}
            onChangeText={(value) => {
              setPhone(value);
              onResetError?.();
              if (formError) {
                setFormError('');
              }
            }}
            placeholder="84 123 4567"
            textContentType="telephoneNumber"
            value={phone}
          />

          {errorMessage ? (
            <Text className="mt-4 text-[14px] leading-5 text-[#D05B5B]">{errorMessage}</Text>
          ) : (
            <Text className="mt-4 text-[14px] leading-5 text-[#7A7A7A]">
              Vais receber o pedido de PIN no telemovel.
            </Text>
          )}

          <Button
            className={`mt-6 h-[56px] rounded-full ${canSubmit ? 'bg-primary' : 'bg-[#C9CDC8]'}`}
            feedbackVariant="none"
            isDisabled={!canSubmit}
            onPress={handleSubmit}>
            <Button.Label className="font-button text-[16px] text-black">
              {isLoading ? 'A recarregar...' : 'Recarregar'}
            </Button.Label>
          </Button>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
