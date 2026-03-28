import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput, type TextInputProps, type TextProps } from 'react-native';

import { AppProviders } from 'providers/AppProviders';

import '../global.css';

const APP_FONT_FAMILY = 'Inter_500Black';
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
    style: [{ fontFamily: APP_FONT_FAMILY }, textDefaultProps.style].filter(Boolean),
  };

  GlobalTextInput.defaultProps = {
    ...textInputDefaultProps,
    style: [{ fontFamily: APP_FONT_FAMILY }, textInputDefaultProps.style].filter(Boolean),
  };

  hasConfiguredGlobalTypography = true;
}

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_900Black,
  });

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
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitleStyle: { fontFamily: APP_FONT_FAMILY },
          headerTitleStyle: { fontFamily: APP_FONT_FAMILY },
        }}>
        <Stack.Screen name="bookings/[id]" />
        <Stack.Screen name="bookings/new" />
        <Stack.Screen name="payments/booking-return" />
      </Stack>
    </AppProviders>
  );
}
