import { RequestHandler } from "express";
import { InvalidRequestException } from "../utils/exceptions/invalid-request.exception";
import { TelegramBody, TelegramMessage } from "../types/webhook.types";
import { commandOperations } from "./operations/command.operations";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { UnknownCommandMessage } from "./messages";
import { callbackOperations } from "./operations/callback.operations";
const logger = new LoggerService(LoggerPaths.WEBHOOK);
export const handler: RequestHandler = (req, res) => {
  // callback button clicked
  if (req.body?.callback_query) {
    const callbackQuery = (req.body as TelegramBody).callback_query;
    let command = callbackQuery.data.toLowerCase();
    logger.info("Received command from callback query", command);
    if (!(command in callbackOperations)) {
      TelegramService.sendMessage(callbackQuery.from.id, UnknownCommandMessage);
      throw new InvalidRequestException("Unknown command");
    }
    callbackOperations[command](callbackQuery.message);
  } else if (
    req.body?.message &&
    req.body.message.text &&
    req.body.message.text.startsWith("/")
  ) {
    // direct message | group message | channel message
    const message = (req.body as TelegramBody).message;

    let command = message.text.substring(1).toLowerCase();
    logger.info("Received command", command);
    if (!(command in commandOperations)) {
      TelegramService.sendMessage(message.chat.id, UnknownCommandMessage);
      throw new InvalidRequestException("Unknown command");
    }
    commandOperations[command](message);
  } else {
    throw new InvalidRequestException("Invalid request body");
  }
  res.status(200).send("OK");
};
