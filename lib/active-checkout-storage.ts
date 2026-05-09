import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_CHECKOUT_KEY = 'active_checkout_session_id';

export async function setActiveCheckoutSessionId(sessionId: string) {
  await AsyncStorage.setItem(ACTIVE_CHECKOUT_KEY, sessionId);
}

export async function getActiveCheckoutSessionId() {
  return AsyncStorage.getItem(ACTIVE_CHECKOUT_KEY);
}

export async function clearActiveCheckoutSessionId() {
  await AsyncStorage.removeItem(ACTIVE_CHECKOUT_KEY);
}
