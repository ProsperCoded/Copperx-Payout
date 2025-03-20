import { UserSession, UserState } from "../../types/session.types";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import redisClient from "../database";

export class SessionService {
  private static instance: SessionService;
  private logger = new LoggerService(LoggerPaths.APP);
  private readonly keyPrefix = "session:";

  private constructor() {}

  public static getInstance(): SessionService {
    if (!this.instance) {
      this.instance = new SessionService();
    }
    return this.instance;
  }

  private getRedisKey(chatId: number): string {
    return `${this.keyPrefix}${chatId}`;
  }

  public async createSession(chatId: number): Promise<UserSession> {
    const session: UserSession = {
      chatId,
      state: UserState.IDLE,
      lastCommandAt: Date.now(),
    };

    try {
      await redisClient.set(this.getRedisKey(chatId), JSON.stringify(session));
      this.logger.info(`Created session for chat ${chatId}`);
      return session;
    } catch (error) {
      this.logger.error(`Error creating session for chat ${chatId}:`, error);
      throw error;
    }
  }

  public async getSession(chatId: number): Promise<UserSession> {
    try {
      const sessionData = await redisClient.get(this.getRedisKey(chatId));

      if (!sessionData) {
        return this.createSession(chatId);
      }

      return JSON.parse(sessionData);
    } catch (error) {
      this.logger.error(`Error retrieving session for chat ${chatId}:`, error);
      // Fallback to creating a new session in case of errors
      return this.createSession(chatId);
    }
  }

  public async updateSession(
    chatId: number,
    updates: Partial<UserSession>
  ): Promise<UserSession> {
    try {
      const session = await this.getSession(chatId);
      const updatedSession = {
        ...session,
        ...updates,
        lastCommandAt: Date.now(),
      };

      await redisClient.set(
        this.getRedisKey(chatId),
        JSON.stringify(updatedSession)
      );

      this.logger.info(`Updated session for chat ${chatId}`, {
        state: updatedSession.state,
      });

      return updatedSession;
    } catch (error) {
      this.logger.error(`Error updating session for chat ${chatId}:`, error);
      throw error;
    }
  }

  public async clearSession(chatId: number): Promise<void> {
    try {
      await redisClient.del(this.getRedisKey(chatId));
      this.logger.info(`Cleared session for chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Error clearing session for chat ${chatId}:`, error);
      throw error;
    }
  }

  // Optional: Add method to set session expiration
  public async setSessionExpiry(
    chatId: number,
    ttlSeconds: number = 86400
  ): Promise<void> {
    try {
      await redisClient.expire(this.getRedisKey(chatId), ttlSeconds);
      this.logger.info(
        `Set expiry for chat ${chatId} session: ${ttlSeconds} seconds`
      );
    } catch (error) {
      this.logger.error(
        `Error setting expiry for chat ${chatId} session:`,
        error
      );
      throw error;
    }
  }
}
