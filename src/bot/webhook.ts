import { RequestHandler } from "express";
import { InvalidRequestException } from "../utils/exceptions/invalid-request.exception";
import { TelegramMessage } from "../types/webhook.types";
import { commandOperations } from "./botOperations";
const CommandHandlers = [];
export const handler: RequestHandler = (req, _res) => {
  if (!req.body || !req.body.message) {
    throw new InvalidRequestException("Invalid request body");
  }
  const message = req.body.message as TelegramMessage;
  if (!message.text) {
    throw new InvalidRequestException("No text property");
  }
  let command = message.text.substring(1).toUpperCase();
  if (!(command in commandOperations)) {
    throw new InvalidRequestException("Unknown command");
  }
  commandOperations[command](message);
};
