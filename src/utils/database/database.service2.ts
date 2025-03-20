import { createClient, RedisClientType } from "redis";
import { configService } from "../config";
import { ENV } from "../../constants/env.enum";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { LoggerService } from "../logger/logger.service";

export class DatabaseService {
  private redisClient: RedisClientType;
  private logger: LoggerService;

  constructor() {
    this.redisClient = createClient({
      url: configService.get(ENV.REDIS_DATABASE_URL),
    });
    this.logger = new LoggerService(LoggerPaths.DATABASE);
    this.redisClient.on("error", (err) => {
      console.log(err);
      this.logger.error("Redis Error:", err);
    });
  }

  async connect(): Promise<void> {
    try {
      this.logger.info("Connecting to Redis ...");
      await this.redisClient.connect();
      this.logger.info("Connected to Redis successfully!");
    } catch (error) {
      this.logger.error("Redis Connection Error:", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redisClient.disconnect();
      this.logger.info("Disconnected from Redis!");
    } catch (error) {
      this.logger.error("Redis Disconnection Error:", error);
    }
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }
}
