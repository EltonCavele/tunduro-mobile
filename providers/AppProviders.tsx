import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { QueryClientProvider } from '@tanstack/react-query';

import { createAppQueryClient } from 'lib/query-client';

import { AuthSessionProvider } from './AuthSessionProvider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthSessionProvider>{children}</AuthSessionProvider>
          </QueryClientProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
