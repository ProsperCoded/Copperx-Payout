export enum UserState {
  IDLE = "IDLE",
  AWAITING_EMAIL = "AWAITING_EMAIL",
  AWAITING_OTP = "AWAITING_OTP",
  AUTHENTICATED = "AUTHENTICATED",
}

export interface UserSession {
  chatId: number;
  state: UserState;
  email?: string;
  userId?: string;
  kycVerified?: boolean; // Add KYC verification status
  lastCommandAt: number;
  authData?: {
    sid?: string;
    accessToken?: string;
    accessTokenId?: string;
    expireAt?: string;
  };
}
