import { UserSession, UserState } from "../../types/session.types";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

export class SessionService {
  private static instance: SessionService;
  private sessions: Map<number, UserSession> = new Map();
  private logger = new LoggerService(LoggerPaths.APP);

  private constructor() {}

  public static getInstance(): SessionService {
    if (!this.instance) {
      this.instance = new SessionService();
    }
    return this.instance;
  }

  public createSession(chatId: number): UserSession {
    const session: UserSession = {
      chatId,
      state: UserState.IDLE,
      lastCommandAt: Date.now(),
    };
    this.sessions.set(chatId, session);
    this.logger.info(`Created session for chat ${chatId}`);
    return session;
  }

  public getSession(chatId: number): UserSession {
    return this.sessions.get(chatId) || this.createSession(chatId);
  }

  public updateSession(
    chatId: number,
    updates: Partial<UserSession>
  ): UserSession {
    const session = this.getSession(chatId);
    const updatedSession = {
      ...session,
      ...updates,
      lastCommandAt: Date.now(),
    };
    this.sessions.set(chatId, updatedSession);
    this.logger.info(`Updated session for chat ${chatId}`, {
      state: updatedSession.state,
    });
    return updatedSession;
  }

  public clearSession(chatId: number): void {
    this.sessions.delete(chatId);
    this.logger.info(`Cleared session for chat ${chatId}`);
  }
}
