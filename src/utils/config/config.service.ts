import { ConfigInterface } from "./config.interface";
import "dotenv/config";
export class ConfigService implements ConfigInterface {
  private static instance: ConfigService;
  private config = process.env;
  get<T = string>(key: string, defaultValue?: T): T | undefined {
    const value = this.config[key];
    return value !== undefined ? (value as T) : defaultValue;
  }

  set<T = string>(key: string, value: T): void {
    process.env[key] = value as unknown as string;
  }

  delete(key: string): void {
    delete process.env[key];
  }

  getAllKeys(): string[] {
    return Object.keys(process.env);
  }
  public static getInstance(): ConfigService {
    if (!this.instance) {
      this.instance = new ConfigService();
    }
    return this.instance;
  }
}
