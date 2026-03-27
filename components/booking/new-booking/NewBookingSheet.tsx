import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

interface NewBookingSheetProps extends PropsWithChildren {
  onClose: () => void;
  title: string;
  visible: boolean;
}

export function NewBookingSheet({
  children,
  onClose,
  title,
  visible,
}: NewBookingSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      return;
    }

    modalRef.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      enableDismissOnClose
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: '#D9D9DD', height: 6, width: 56 }}
      keyboardBehavior="interactive"
      onDismiss={onClose}>
      <View className="flex-1 px-6 pb-8 pt-2">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[20px] font-semibold text-[#111111]">{title}</Text>

          <Pressable
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
            onPress={onClose}>
            <X size={20} stroke="#181818" strokeWidth={2.3} />
          </Pressable>
        </View>

        <View className="flex-1">{children}</View>
      </View>
    </BottomSheetModal>
  );
}
