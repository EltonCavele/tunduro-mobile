import { Redirect } from 'expo-router';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

export default function Index() {
  const { hasSession, isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A carregar sessao..." />;
  }

  if (!hasSession) {
    return <Redirect href="/welcome" />;
  }

  if (isVerified) {
    return <Redirect href="/(tabs)/inicio" />;
  }

  const identifier = getPreferredIdentifier(user);

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
