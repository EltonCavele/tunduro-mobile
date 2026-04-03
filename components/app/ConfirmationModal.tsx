import { Button, Dialog } from 'heroui-native';
import { View } from 'react-native';

interface ConfirmationModalProps {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  tone?: 'danger' | 'default';
}

const CONFIRM_BUTTON_STYLES = {
  danger: {
    buttonClassName: 'bg-[#FCE8E6]',
    labelClassName: 'text-[#C54D4D]',
  },
  default: {
    buttonClassName: 'bg-[#1F1F1F]',
    labelClassName: 'text-white',
  },
} as const;

export function ConfirmationModal({
  cancelLabel = 'Voltar',
  confirmLabel,
  description,
  isLoading = false,
  isOpen,
  onClose,
  onConfirm,
  title,
  tone = 'default',
}: ConfirmationModalProps) {
  const confirmButtonStyles = CONFIRM_BUTTON_STYLES[tone];

  function handleClose() {
    if (!isLoading) {
      onClose();
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}>
      <Dialog.Portal className="items-center justify-center px-5">
        <Dialog.Overlay
          isCloseOnPress={!isLoading}
          style={{ backgroundColor: 'rgba(17, 17, 17, 0.32)' }}
        />

        <Dialog.Content className="w-full max-w-[360px] rounded-[28px] bg-white px-5 py-5">
          <Dialog.Title className="text-[20px] text-[#171717]">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-[14px] leading-6 text-[#717171]">
            {description}
          </Dialog.Description>

          <View className="mt-6 flex-row gap-3">
            <Button
              className="h-14 flex-1 rounded-[18px] bg-[#F5F5F5]"
              feedbackVariant="none"
              isDisabled={isLoading}
              onPress={handleClose}
              variant="secondary">
              <Button.Label className="text-[14px] text-[#171717]">{cancelLabel}</Button.Label>
            </Button>

            <Button
              className={`h-14 flex-1 rounded-[18px] ${confirmButtonStyles.buttonClassName}`}
              feedbackVariant="none"
              isDisabled={isLoading}
              onPress={onConfirm}
              variant={tone === 'danger' ? 'secondary' : undefined}>
              <Button.Label className={`text-[14px] ${confirmButtonStyles.labelClassName}`}>
                {confirmLabel}
              </Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
