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
        level: "debug",
      },
      transport
    );
  }

  /**
   * Private helper method to handle logging with consistent format
   * @param level The log level (info, debug, error, warn)
   * @param message The primary message to log
   * @param args Additional arguments to include in the log
   */
  private log(
    level: "info" | "debug" | "error" | "warn",
    message: string,
    ...args: any[]
  ): void {
    if (args.length === 0) {
      this.logger[level](message);
    } else if (args.length === 1 && typeof args[0] === "object") {
      // If a single object is provided, merge it with the message
      this.logger[level]({ msg: message, ...args[0] });
    } else {
      // Handle multiple arguments or non-object arguments
      this.logger[level]({ msg: message, data: args });
    }
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }
}
