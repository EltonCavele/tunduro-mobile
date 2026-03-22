import type { UserProfile } from './auth.types';

export const AUTH_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function splitFullName(fullName: string) {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return {
      firstName: undefined,
      lastName: undefined,
    };
  }

  if (tokens.length === 1) {
    return {
      firstName: tokens[0],
      lastName: undefined,
    };
  }

  return {
    firstName: tokens[0],
    lastName: tokens.slice(1).join(' '),
  };
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getPreferredIdentifier(
  user?: Pick<UserProfile, 'email' | 'phone'> | null,
  fallback?: string
) {
  return user?.email?.trim() || user?.phone?.trim() || fallback?.trim() || '';
}

export function maskIdentifier(identifier: string) {
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier) {
    return '';
  }

  if (trimmedIdentifier.includes('@')) {
    const [localPart, domain] = trimmedIdentifier.split('@');
    const visibleLocalPart = localPart.slice(0, Math.min(localPart.length, 3));
    return `${visibleLocalPart}${'*'.repeat(Math.max(localPart.length - visibleLocalPart.length, 0))}@${domain}`;
  }

  const cleanDigits = trimmedIdentifier.replace(/\s+/g, '');
  if (cleanDigits.length <= 4) {
    return cleanDigits;
  }

  return `${cleanDigits.slice(0, 3)}${'*'.repeat(
    Math.max(cleanDigits.length - 5, 0)
  )}${cleanDigits.slice(-2)}`;
}

export function getUserDisplayName(user?: Pick<UserProfile, 'firstName' | 'lastName'> | null) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  return fullName || 'Utilizador';
}

export function getUserInitials(
  user?: Pick<UserProfile, 'firstName' | 'lastName' | 'email'> | null
) {
  const base = getUserDisplayName(user);
  const initials = base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || user?.email?.slice(0, 2).toUpperCase() || 'CT';
}
