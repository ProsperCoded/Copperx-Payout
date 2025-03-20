import Redis, { RedisOptions } from "ioredis";
import { configService } from "../config";
import { ENV } from "../../constants/env.enum";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { LoggerService } from "../logger/logger.service";

export class DatabaseService {
  private redisClient: Redis;
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService(LoggerPaths.DATABASE);

    const redisOptions: RedisOptions = {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 500, 2000);
        return delay;
      },
      maxRetriesPerRequest: 5,
      enableReadyCheck: true,
      connectTimeout: 10000,
      keepAlive: 30000,
      family: 4,
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    };

    this.redisClient = new Redis(
      configService.get(ENV.REDIS_DATABASE_URL),
      redisOptions
    );

    this.redisClient.on("connect", () => {
      this.logger.info("Connected to Redis successfully!");
    });

    this.redisClient.on("error", (err) => {
      this.logger.error("Redis Error:", err);
    });

    this.redisClient.on("close", () => {
      this.logger.warn("Redis connection closed!");
    });

    this.redisClient.on("reconnecting", () => {
      this.logger.info("Attempting to reconnect to Redis...");
    });
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping();
      return result === "PONG";
    } catch (error) {
      this.logger.error("Redis Ping Error:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit();
      this.logger.info("Disconnected from Redis!");
    } catch (error) {
      this.logger.error("Redis Disconnection Error:", error);
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
