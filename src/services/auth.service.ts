import { CopperxApiAuthService } from "../utils/copperxApi/copperxApi.auth";
import { SessionService } from "../utils/session/session.service";
import { UserState } from "../types/session.types";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { UserProfile } from "../types/user.types";

export class AuthService {
  private static instance: AuthService;
  private sessionService = SessionService.getInstance();
  private copperxAuthApi = new CopperxApiAuthService();
  private logger = new LoggerService(LoggerPaths.APP);

  private constructor() {}

  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }

  async initiateLogin(chatId: number, email: string): Promise<boolean> {
    try {
      const { sid } = await this.copperxAuthApi.requestEmailOtp(email);
      await this.sessionService.updateSession(chatId, {
        email,
        state: UserState.AWAITING_OTP,
        authData: { sid },
      });
      await TelegramService.sendMessage(
        chatId,
        "An OTP has been sent to your email. Please enter it to complete your login:"
      );
      return true;
    } catch (error) {
      this.logger.error("Error initiating login", {
        error: error.message,
        email,
        chatId,
      });
      await TelegramService.sendMessage(
        chatId,
        "Sorry, we couldn't send an OTP to that email. Please try again or contact support."
      );
      // Reset to IDLE state
      await this.sessionService.updateSession(chatId, {
        state: UserState.IDLE,
      });
      return false;
    }
  }

  async verifyOtp(chatId: number, otp: string): Promise<UserProfile | null> {
    const session = await this.sessionService.getSession(chatId);
    if (!session.email || !session.authData?.sid) {
      await TelegramService.sendMessage(
        chatId,
        "Your session has expired. Please start the login process again."
      );
      await this.sessionService.updateSession(chatId, {
        state: UserState.IDLE,
      });
      return null;
    }

    try {
      const authResult = await this.copperxAuthApi.authenticateWithEmailOtp(
        session.email,
        otp,
        session.authData.sid
      );
      // Store authentication data in session
      await this.sessionService.updateSession(chatId, {
        state: UserState.AUTHENTICATED,
        authData: {
          accessToken: authResult.accessToken,
          accessTokenId: authResult.accessTokenId,
          expireAt: authResult.expireAt,
        },
      });
      return authResult.user;
    } catch (error) {
      this.logger.error("OTP verification failed", {
        error: error.message,
        email: session.email,
        chatId,
      });
      await TelegramService.sendMessage(
        chatId,
        "Invalid OTP. Please try again or restart the login process with /login."
      );
      return null;
    }
  }

  async isAuthenticated(chatId: number): Promise<boolean> {
    const session = await this.sessionService.getSession(chatId);
    return (
      session.state === UserState.AUTHENTICATED &&
      !!session.authData?.accessToken &&
      new Date(session.authData.expireAt) > new Date()
    );
  }

  async getAccessToken(chatId: number): Promise<string | null> {
    const session = await this.sessionService.getSession(chatId);
    if (await this.isAuthenticated(chatId)) {
      return session.authData.accessToken;
    }
    return null;
  }

  async logout(chatId: number): Promise<void> {
    await this.sessionService.updateSession(chatId, {
      state: UserState.IDLE,
      authData: undefined,
    });
  }
}
