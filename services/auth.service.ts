import { api, unwrapResponse } from 'lib/api';
import type { ApiGenericResponse } from 'lib/api.types';
import type {
  AuthRefreshResponse,
  AuthResponse,
  ForgotPasswordPayload,
  RequestVerificationOtpPayload,
  ResetPasswordPayload,
  UserCreatePayload,
  UserLoginPayload,
  VerifyAccountPayload,
} from 'lib/auth.types';

const AUTH_BASE_PATH = '/v1/auth';

export function signIn(payload: UserLoginPayload) {
  return unwrapResponse<AuthResponse>(api.post(`${AUTH_BASE_PATH}/login`, payload));
}

export function signUp(payload: UserCreatePayload) {
  return unwrapResponse<AuthResponse>(api.post(`${AUTH_BASE_PATH}/signup`, payload));
}

export function requestVerificationOtp(payload: RequestVerificationOtpPayload) {
  return unwrapResponse<ApiGenericResponse>(
    api.post(`${AUTH_BASE_PATH}/verify/request-otp`, payload)
  );
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return unwrapResponse<ApiGenericResponse>(api.post(`${AUTH_BASE_PATH}/verify`, payload));
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return unwrapResponse<ApiGenericResponse>(api.post(`${AUTH_BASE_PATH}/forgot-password`, payload));
}

export function resetPassword(payload: ResetPasswordPayload) {
  return unwrapResponse<ApiGenericResponse>(api.post(`${AUTH_BASE_PATH}/reset-password`, payload));
}

export function logoutAllDevices() {
  return unwrapResponse<ApiGenericResponse>(api.post(`${AUTH_BASE_PATH}/logout-all`));
}

export function refreshTokens() {
  return unwrapResponse<AuthRefreshResponse>(api.get(`${AUTH_BASE_PATH}/refresh-token`));
}
