import { RequestHandler } from "express";
import { InvalidRequestException } from "../utils/exceptions/invalid-request.exception";
import { TelegramBody, TelegramMessage } from "../types/webhook.types";
import { commandOperations } from "./operations/command.operations";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { UnknownCommandMessage } from "./messages";
import {
  callbackOperations,
  handleCallback,
} from "./operations/callback.operations";
import { SessionService } from "../utils/session/session.service";
import { UserState } from "../types/session.types";
import { handleEmailInput, handleOtpInput } from "./handlers/login.handler";

export const logger = new LoggerService(LoggerPaths.WEBHOOK);
const sessionService = SessionService.getInstance();

export const handler: RequestHandler = async (req, res) => {
  try {
    // callback button clicked
    if (req.body?.callback_query) {
      const callbackQuery = (req.body as TelegramBody).callback_query;
      let callbackData = callbackQuery.data.toLowerCase();
      logger.info("Received callback", callbackData);

      // Handle all callbacks through the unified handler
      await handleCallback(callbackData, callbackQuery.message);
    } else if (req.body?.message) {
      const message = (req.body as TelegramBody).message;
      const chatId = message.chat.id;
      // Get session asynchronously
      const session = await sessionService.getSession(chatId);

      // Handle command messages
      if (message.text?.startsWith("/")) {
        let command = message.text.substring(1).toLowerCase();
        logger.info("Received command", command);

        if (!(command in commandOperations)) {
          await TelegramService.sendMessage(
            message.chat.id,
            UnknownCommandMessage
          );
          throw new InvalidRequestException("Unknown command");
        }

        await commandOperations[command](message);
        res.status(200).send();
        return;
      }

      // Handle text messages based on user state
      switch (session.state) {
        case UserState.AWAITING_EMAIL:
          await handleEmailInput(message);
          break;
        case UserState.AWAITING_OTP:
          await handleOtpInput(message);
          break;
        default:
          // Handle unexpected messages
          await TelegramService.sendMessage(
            chatId,
            "I'm not sure what you want to do. Please use a command or button."
          );
      }
    } else {
      throw new InvalidRequestException("Invalid request body");
    }

    res.status(200).send();
  } catch (error) {
    logger.error("Error in webhook handler", { error: error.message });
    res.status(200).send(); // Always return 200 to Telegram to prevent retry
  }
};
