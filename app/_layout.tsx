import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput, type TextInputProps, type TextProps } from 'react-native';

import { resolvePoppinsTextStyle } from 'lib/resolve-poppins-style';
import { poppinsFontAssets, typography } from 'lib/typography';
import { AppProviders } from 'providers/AppProviders';
import { usePushDeepLinking } from 'hooks/usePushDeepLinking';
import { useResumeActiveCheckout } from 'hooks/useResumeActiveCheckout';

import '../global.css';

const GlobalText = Text as typeof Text & { defaultProps?: TextProps };
const GlobalTextInput = TextInput as typeof TextInput & { defaultProps?: TextInputProps };

let hasConfiguredGlobalTypography = false;

function configureGlobalTypography() {
  if (hasConfiguredGlobalTypography) {
    return;
  }

  const textDefaultProps = GlobalText.defaultProps ?? {};
  const textInputDefaultProps = GlobalTextInput.defaultProps ?? {};

  GlobalText.defaultProps = {
    ...textDefaultProps,
    style: resolvePoppinsTextStyle(textDefaultProps.style, 'body'),
  };

  GlobalTextInput.defaultProps = {
    ...textInputDefaultProps,
    style: resolvePoppinsTextStyle(textInputDefaultProps.style, 'input'),
  };

  hasConfiguredGlobalTypography = true;
}

void SplashScreen.preventAutoHideAsync();

function AppNavigation() {
  usePushDeepLinking();
  useResumeActiveCheckout();

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitleStyle: { fontFamily: typography.title },
          headerTitleStyle: { fontFamily: typography.titleBold },
        }}>
        <Stack.Screen name="bookings/new" />
        <Stack.Screen name="bookings/[id]" />
        <Stack.Screen name="checkout/[sessionId]" />
        <Stack.Screen name="checkout/failed" />
        <Stack.Screen name="checkout/expired" />
        <Stack.Screen name="booking/[id]/success" />
        <Stack.Screen name="payments/booking-return" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(poppinsFontAssets);

  useEffect(() => {
    if (loaded) {
      configureGlobalTypography();
    }

    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProviders>
      <AppNavigation />
    </AppProviders>
  );
}
