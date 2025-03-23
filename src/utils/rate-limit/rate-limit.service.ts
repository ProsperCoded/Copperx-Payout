import redisClient from "../database";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

export class RateLimitService {
  private static instance: RateLimitService;
  private logger = new LoggerService(LoggerPaths.APP);
  private readonly keyPrefix = "rate_limit:";
  private readonly maxRequests = 10; // 10 requests per minute
  private readonly windowSeconds = 60; // 1 minute window

  private constructor() {}

  public static getInstance(): RateLimitService {
    if (!this.instance) {
      this.instance = new RateLimitService();
    }
    return this.instance;
  }

  private getRedisKey(chatId: number): string {
    return `${this.keyPrefix}${chatId}`;
  }

  /**
   * Increments the request count for a user and checks if they're rate limited
   * @param chatId The chat ID of the user
   * @returns An object containing isLimited flag and resetTime if applicable
   */
  public async checkRateLimit(chatId: number): Promise<{
    isLimited: boolean;
    requests: number;
    resetTime?: number;
    remainingSeconds?: number;
  }> {
    try {
      const key = this.getRedisKey(chatId);

      // Increment the counter
      const requests = await redisClient.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redisClient.expire(key, this.windowSeconds);
      }

      // Get remaining time until reset
      const ttl = await redisClient.ttl(key);
      const resetTime = Date.now() + ttl * 1000;

      // Check if the user is rate limited
      const isLimited = requests > this.maxRequests;

      return {
        isLimited,
        requests,
        resetTime,
        remainingSeconds: ttl,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for chat ${chatId}:`, error);
      // In case of error, don't rate limit to avoid blocking legitimate users
      return { isLimited: false, requests: 0 };
    }
  }

  /**
   * Gets the current request count for a user without incrementing
   * @param chatId The chat ID of the user
   * @returns The current request count and TTL info
   */
  public async getCurrentCount(chatId: number): Promise<{
    count: number;
    ttl: number;
  }> {
    try {
      const key = this.getRedisKey(chatId);
      const count = parseInt((await redisClient.get(key)) || "0");
      const ttl = await redisClient.ttl(key);

      return { count, ttl };
    } catch (error) {
      this.logger.error(`Error getting count for chat ${chatId}:`, error);
      return { count: 0, ttl: 0 };
    }
  }
}
