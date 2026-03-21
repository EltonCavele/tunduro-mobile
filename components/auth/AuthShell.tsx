import type { ReactNode } from 'react';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const START_PAGE_IMAGE = require('../../assets/imgs/startpage.png');

interface AuthShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: ReactNode;
  onBackPress: () => void;
  eyebrow?: string;
  footer?: ReactNode;
  compactHero?: boolean;
}

export function AuthShell({
  title,
  subtitle,
  icon: Icon,
  children,
  onBackPress,
  eyebrow = 'Clube de Tenis de Maputo',
  footer,
  compactHero = false,
}: AuthShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className={compactHero ? 'h-[254px]' : 'h-[302px]'}>
            <ImageBackground
              className="h-full w-full"
              resizeMode="cover"
              source={START_PAGE_IMAGE}>
              <LinearGradient
                className="flex-1 px-6 pb-8 pt-4"
                colors={[
                  'rgba(10,15,11,0.18)',
                  'rgba(10,15,11,0.55)',
                  'rgba(255,255,255,0.97)',
                ]}
                locations={[0, 0.55, 1]}>
                <View className="flex-row items-center justify-between">
                  <Pressable
                    accessibilityRole="button"
                    className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
                    onPress={onBackPress}>
                    <ArrowLeft size={20} stroke="#FFFFFF" strokeWidth={2.4} />
                  </Pressable>

                  <View className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-white">
                      CTM
                    </Text>
                  </View>
                </View>

                <View className="mt-auto w-[90%]">
                  <View className="mb-4 h-14 w-14 items-center justify-center rounded-[18px] bg-white/18">
                    <Icon size={24} stroke="#FFFFFF" strokeWidth={2.2} />
                  </View>

                  <Text className="text-[12px] font-semibold uppercase tracking-[1.2px] text-white/75">
                    {eyebrow}
                  </Text>
                  <Text className="mt-2 text-[30px] font-bold leading-[36px] tracking-[-0.7px] text-white">
                    {title}
                  </Text>
                  <Text className="mt-3 text-[15px] leading-6 text-white/85">
                    {subtitle}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          <View className="-mt-6 flex-1 rounded-t-[30px] bg-white px-6 pb-10 pt-3">
            {children}
            {footer ? <View className="mt-8">{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
