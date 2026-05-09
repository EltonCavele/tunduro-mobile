import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_CHECKOUT_KEY = 'active_checkout_session_id';
let inMemorySessionId: string | null = null;

function isAsyncStorageAvailable() {
  return Boolean(AsyncStorage?.getItem && AsyncStorage?.setItem && AsyncStorage?.removeItem);
}

export async function setActiveCheckoutSessionId(sessionId: string) {
  inMemorySessionId = sessionId;

  if (!isAsyncStorageAvailable()) {
    return;
  }

  try {
    await AsyncStorage.setItem(ACTIVE_CHECKOUT_KEY, sessionId);
  } catch {
    // Fallback silencioso para o armazenamento em memória nesta sessão.
  }
}

export async function getActiveCheckoutSessionId() {
  if (!isAsyncStorageAvailable()) {
    return inMemorySessionId;
  }

  try {
    const storedValue = await AsyncStorage.getItem(ACTIVE_CHECKOUT_KEY);

    if (storedValue) {
      inMemorySessionId = storedValue;
    }

    return storedValue ?? inMemorySessionId;
  } catch {
    return inMemorySessionId;
  }
}

export async function clearActiveCheckoutSessionId() {
  inMemorySessionId = null;

  if (!isAsyncStorageAvailable()) {
    return;
  }

  try {
    await AsyncStorage.removeItem(ACTIVE_CHECKOUT_KEY);
  } catch {
    // Fallback silencioso para evitar crash quando o módulo nativo não existe.
  }
}
