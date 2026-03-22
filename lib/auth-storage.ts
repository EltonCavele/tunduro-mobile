import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from './auth.types';

const AUTH_STORAGE_KEY = 'tunduro.auth.tokens';

type AuthStorageListener = (tokens: AuthTokens | null) => void;

let currentTokens: AuthTokens | null = null;
let hasHydratedStorage = false;

const listeners = new Set<AuthStorageListener>();

function emitAuthStorageChange() {
  listeners.forEach((listener) => {
    listener(currentTokens);
  });
}

function sanitizeTokens(value: unknown): AuthTokens | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const accessToken = Reflect.get(value, 'accessToken');
  const refreshToken = Reflect.get(value, 'refreshToken');

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    return null;
  }

  if (!accessToken.trim() || !refreshToken.trim()) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function hydrateAuthStorage() {
  try {
    const rawTokens = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);

    currentTokens = rawTokens ? sanitizeTokens(JSON.parse(rawTokens)) : null;

    if (rawTokens && !currentTokens) {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
  } catch {
    currentTokens = null;
  } finally {
    hasHydratedStorage = true;
    emitAuthStorageChange();
  }

  return currentTokens;
}

export async function setAuthTokens(tokens: AuthTokens) {
  const sanitizedTokens = sanitizeTokens(tokens);

  if (!sanitizedTokens) {
    throw new Error('Sessao invalida.');
  }

  currentTokens = sanitizedTokens;
  hasHydratedStorage = true;

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(sanitizedTokens));

  emitAuthStorageChange();

  return sanitizedTokens;
}

export async function clearAuthStorage() {
  currentTokens = null;
  hasHydratedStorage = true;

  try {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
  } finally {
    emitAuthStorageChange();
  }
}

export function getAuthTokens() {
  return currentTokens;
}

export function getAccessToken() {
  return currentTokens?.accessToken ?? null;
}

export function getRefreshToken() {
  return currentTokens?.refreshToken ?? null;
}

export function isAuthStorageHydrated() {
  return hasHydratedStorage;
}

export function subscribeAuthStorage(listener: AuthStorageListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
