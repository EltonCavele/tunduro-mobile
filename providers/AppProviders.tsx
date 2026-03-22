import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { createAppQueryClient } from 'lib/query-client';

import { AuthSessionProvider } from './AuthSessionProvider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </QueryClientProvider>
  );
}
