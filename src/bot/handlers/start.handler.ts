import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { welcomeMessage } from "../messages/start.messages";

export async function handleStart(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  await TelegramService.sendMessage(chatId, welcomeMessage, {
    inlineKeyboard: [
      [{ text: "🔐 Login to CopperX", callback_data: "login" }],
      [{ text: "ℹ️ Help", callback_data: "help" }],
    ],
  });
}
