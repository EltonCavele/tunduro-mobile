import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  clearAuthStorage,
  getAuthTokens,
  hydrateAuthStorage,
  setAuthTokens,
  subscribeAuthStorage,
} from '../lib/auth-storage';
import type { AuthResponse, AuthTokens, UserProfile } from 'lib/auth.types';
import { authQueryKeys, bookingQueryKeys } from 'lib/query-keys';

interface AuthSessionContextValue {
  tokens: AuthTokens | null;
  hasSession: boolean;
  isHydrated: boolean;
  persistTokens: (tokens: AuthTokens) => Promise<void>;
  applyAuthResponse: (response: AuthResponse) => Promise<void>;
  seedProfile: (user: UserProfile) => void;
  clearSession: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [tokens, setTokensState] = useState<AuthTokens | null>(() => getAuthTokens());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeAuthStorage((nextTokens) => {
      if (!isMounted) {
        return;
      }

      setTokensState(nextTokens);
      setIsHydrated(true);

      if (!nextTokens) {
        queryClient.removeQueries({
          queryKey: authQueryKeys.all,
        });
        queryClient.removeQueries({
          queryKey: bookingQueryKeys.all,
        });
      }
    });

    hydrateAuthStorage().finally(() => {
      if (isMounted) {
        setTokensState(getAuthTokens());
        setIsHydrated(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [queryClient]);

  const persistTokens = useCallback(async (nextTokens: AuthTokens) => {
    await setAuthTokens(nextTokens);
  }, []);

  const seedProfile = useCallback(
    (user: UserProfile) => {
      queryClient.setQueryData(authQueryKeys.profile, user);
    },
    [queryClient]
  );

  const applyAuthResponse = useCallback(
    async (response: AuthResponse) => {
      await setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      queryClient.removeQueries({
        queryKey: bookingQueryKeys.all,
      });
      queryClient.setQueryData(authQueryKeys.profile, response.user);
    },
    [queryClient]
  );

  const clearSession = useCallback(async () => {
    await clearAuthStorage();

    queryClient.removeQueries({
      queryKey: authQueryKeys.all,
    });
    queryClient.removeQueries({
      queryKey: bookingQueryKeys.all,
    });
  }, [queryClient]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      tokens,
      hasSession: Boolean(tokens?.accessToken && tokens?.refreshToken),
      isHydrated,
      persistTokens,
      applyAuthResponse,
      seedProfile,
      clearSession,
    }),
    [applyAuthResponse, clearSession, isHydrated, persistTokens, seedProfile, tokens]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSessionContext() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSessionContext must be used within AuthSessionProvider.');
  }

  return context;
}
