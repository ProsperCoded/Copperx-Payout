import { RequestHandler } from "express";
import { InvalidRequestException } from "../utils/exceptions/invalid-request.exception";
import { TelegramBody } from "../types/webhook.types";
import { commandOperations } from "./operations/command.operations";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { UnknownCommandMessage } from "./messages";
import { handleCallback } from "./operations/callback.operations";
import { SessionService } from "../utils/session/session.service";
import { UserState } from "../types/session.types";
import { handleEmailInput, handleOtpInput } from "./handlers/login.handler";
import { AuthService } from "../services/auth.service";
import { checkKycVerification } from "./utils/kyc-verification";
import {
  handleAmountInput,
  handleRecipientInput,
} from "./handlers/transfer.handler";
import { RateLimitService } from "../utils/rate-limit/rate-limit.service";
import { rateLimitExceededMessage } from "./messages/error.messages";

export const logger = new LoggerService(LoggerPaths.WEBHOOK);
const sessionService = SessionService.getInstance();
const rateLimitService = RateLimitService.getInstance();

// List of commands that don't require KYC verification
const kycExemptCommands = ["start", "login", "help"];
const authService = AuthService.getInstance();
export const handler: RequestHandler = async (req, res) => {
  try {
    let chatId: number | undefined;

    // Extract the chatId from the request
    if (req.body?.callback_query) {
      chatId = req.body.callback_query.message.chat.id;
    } else if (req.body?.message) {
      chatId = req.body.message.chat.id;
    }

    // If we have a chatId, check for rate limiting
    if (chatId) {
      const rateLimit = await rateLimitService.checkRateLimit(chatId);

      if (rateLimit.isLimited) {
        logger.warn(`Rate limit exceeded for chat ${chatId}`);

        // Send rate limit message to the user
        if (rateLimit.remainingSeconds) {
          await TelegramService.sendMessage(
            chatId,
            rateLimitExceededMessage(rateLimit.remainingSeconds)
          );
        }

        res.status(200).send();
        return;
      }
    }

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

        // Check if the command requires KYC verification
        if (!kycExemptCommands.includes(command)) {
          // If authenticated but not KYC verified
          if (
            (await authService.isAuthenticated(chatId)) &&
            !(await checkKycVerification(chatId, "this command"))
          ) {
            res.status(200).send();
            return;
          }
        }

        await commandOperations[command](message);
        res.status(200).send();
        return;
      }

      // Handle text messages based on user state
      switch (session.state) {
        case UserState.AWAITING_LOGIN_EMAIL:
          await handleEmailInput(message);
          break;
        case UserState.AWAITING_RECIPIENT_EMAIL:
          await handleRecipientInput(message);
          break;
        case UserState.AWAITING_OTP:
          await handleOtpInput(message);
          break;
        case UserState.AWAITING_WALLET_ADDRESS:
          await handleRecipientInput(message);
          break;
        case UserState.AWAITING_AMOUNT:
          await handleAmountInput(message);
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
