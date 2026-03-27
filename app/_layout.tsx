import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from 'providers/AppProviders';

import '../global.css';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="bookings/[id]" />
        <Stack.Screen name="bookings/new" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="payments/booking-return" />
      </Stack>
    </AppProviders>
  );
}
