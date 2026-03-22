export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type Role = 'USER' | 'ADMIN' | 'TRAINER';

export type OtpChannel = 'EMAIL' | 'SMS';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  gender: Gender;
  avatarUrl: string | null;
  level: string | null;
  favoriteCourt: string | null;
  preferredTimeSlots: string[];
  notifyPush: boolean;
  notifySms: boolean;
  notifyEmail: boolean;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserProfile;
}

export type AuthRefreshResponse = AuthTokens;

export interface UserLoginPayload {
  identifier?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
}

export interface RequestVerificationOtpPayload {
  identifier: string;
  channel?: OtpChannel;
}

export interface VerifyAccountPayload {
  identifier: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ResetPasswordPayload extends VerifyAccountPayload {
  newPassword: string;
}
