import { Redirect, Stack, useSegments } from 'expo-router';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

export default function AuthLayout() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { hasSession, isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A validar sessao..." />;
  }

  if (hasSession) {
    if (isVerified) {
      return <Redirect href="/(tabs)/index" />;
    }

    const identifier = getPreferredIdentifier(user);

    if (currentRoute !== 'verify-account') {
      return (
        <Redirect
          href={
            identifier
              ? {
                  pathname: '/auth/verify-account',
                  params: { identifier },
                }
              : '/auth/verify-account'
          }
        />
      );
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
