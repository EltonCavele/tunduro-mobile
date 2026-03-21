import type { ReactNode } from 'react';

import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthMinimalScreenProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthMinimalScreen({
  title,
  children,
  footer,
}: AuthMinimalScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-9 pb-20 pt-24">
            <Text className="mb-12 text-center text-[28px] font-bold tracking-[-0.4px] text-[#101010]">
              {title}
            </Text>

            {children}
            {footer ? <View className="mt-7">{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
