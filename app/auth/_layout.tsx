import { Redirect, Stack, useSegments } from 'expo-router';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

export default function AuthLayout() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A validar sessao..." />;
  }

  if (user) {
    if (isVerified) {
      return <Redirect href="/(tabs)" />;
    }

    const identifier = getPreferredIdentifier(user);
    const verifyAccountHref = identifier
      ? `/auth/verify-account?identifier=${encodeURIComponent(identifier)}`
      : '/auth/verify-account';

    if (currentRoute !== 'verify-account') {
      return <Redirect href={verifyAccountHref} />;
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
