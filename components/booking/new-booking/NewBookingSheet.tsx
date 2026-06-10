import type { PropsWithChildren } from 'react';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from 'heroui-native';
import { View } from 'react-native';

interface NewBookingSheetProps extends PropsWithChildren {
  enableScroll?: boolean;
  onClose: () => void;
  snapPoints?: string[];
  title: string;
  visible: boolean;
}

export function NewBookingSheet({
  children,
  enableScroll = true,
  onClose,
  title,
  visible,
  snapPoints = ['50%'],
}: NewBookingSheetProps) {
  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay style={{ backgroundColor: 'rgba(17, 17, 17, 0.3)' }} />

        <BottomSheet.Content
          android_keyboardInputMode="adjustResize"
          backgroundClassName="rounded-t-[32px] bg-white"
          contentContainerClassName="px-6 pb-8 pt-2"
          enableDynamicSizing={false}
          handleIndicatorClassName="bg-[#D9D9DD]"
          keyboardBehavior="interactive"
          snapPoints={snapPoints}>
          <View className="mb-4 flex-row items-center justify-between">
            <BottomSheet.Title className="font-title text-[18px] text-[#111111]">
              {title}
            </BottomSheet.Title>

            <BottomSheet.Close
              className="bg-[#F4F4F6]"
              iconProps={{ color: '#181818', size: 20 }}
            />
          </View>

          {enableScroll ? (
            <BottomSheetScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator>
              {children}
            </BottomSheetScrollView>
          ) : (
            <View className="min-h-0 flex-1">{children}</View>
          )}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
