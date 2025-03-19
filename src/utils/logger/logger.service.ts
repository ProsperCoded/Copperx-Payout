import { LoggerPaths } from "../../constants/logger-paths.enum";
import { configService } from "../config";
import { ILogger } from "./logger.interface";
import pino from "pino";
import { ENV } from "../../constants/env.enum";
import fs from "fs";
import path from "path";
export class LoggerService implements ILogger {
  private logger: pino.Logger;
  constructor(private loggerPath: LoggerPaths) {
    // * create log files & folders
    const label =
      Object.keys(LoggerPaths)[Object.values(LoggerPaths).indexOf(loggerPath)];

    const fullPath = path.join(__dirname, "..", "..", loggerPath);

    const dirExists = fs.existsSync(path.dirname(fullPath));
    if (!dirExists) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    }
    const fileExists = fs.existsSync(fullPath);

    if (!fileExists) {
      fs.writeFileSync(fullPath, "");
    }
    // ! development mode enforced temporarily
    const isDev = true || configService.get(ENV.NODE_ENV) === "development";
    const transport = pino.transport({
      targets: [
        // Pretty logs for console in development
        isDev
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "yyyy-mm-dd HH:MM:ss",
                ignore: "pid,hostname",
              },
            }
          : null,
        // File logging in JSON format
        {
          target: "pino/file",
          options: { destination: this.loggerPath },
        },
      ].filter(Boolean) as any[], // Remove null if not in development
    });
    this.logger = pino(
      {
        base: { label },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      transport
    );
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }
  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }
  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }
}
