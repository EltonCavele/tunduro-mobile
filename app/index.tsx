import { Redirect } from 'expo-router';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { useAuthStatus } from 'hooks/useAuthStatus';
import { getPreferredIdentifier } from 'lib/auth-utils';

export default function Index() {
  const { isLoading, isVerified, user } = useAuthStatus();

  if (isLoading) {
    return <AppScreenLoader message="A carregar sessao..." />;
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  if (isVerified) {
    return <Redirect href="/(tabs)" />;
  }

  const identifier = getPreferredIdentifier(user);
  const verifyAccountHref = identifier
    ? `/auth/verify-account?identifier=${encodeURIComponent(identifier)}`
    : '/auth/verify-account';

  return <Redirect href={verifyAccountHref} />;
}
