import { NextFunction } from "express";
import { BaseException } from "../exceptions/base.exception";
import { Response, Request } from "express";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

const logErrors = new LoggerService(LoggerPaths.ERROR);
export function errorHandler(
  error: BaseException,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const status = error.status || 500;

  const message = error.message || "Something went wrong";

  logErrors.error(error.toString());
  // sending 200 status code to avoid telegram from retrying the webhook
  res.status(200).send();
  next();
}
