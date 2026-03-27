import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

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
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        sheetRef.current?.snapToIndex(0);
      });
      return;
    }

    sheetRef.current?.close();
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
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: '#D9D9DD', height: 6, width: 56 }}
      keyboardBehavior="interactive"
      onClose={onClose}>
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-1 px-6 pb-8 pt-2">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-semibold text-[#111111]">{title}</Text>

            <Pressable
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F6]"
              onPress={() => sheetRef.current?.close()}>
              <X size={20} stroke="#181818" strokeWidth={2.3} />
            </Pressable>
          </View>

          <View className="flex-1">{children}</View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
