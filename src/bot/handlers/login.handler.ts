import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { loginMessage } from "../messages/start.messages";

export function loginHandler(msgObj: TelegramMessage) {
  TelegramService.sendMessage(msgObj.chat.id, loginMessage);
}
