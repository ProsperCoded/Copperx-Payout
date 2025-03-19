import { CallbackEnum } from "../../constants/callback.enum";
import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { welcomeMessage } from "../messages/start.messages";

export async function startHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  await TelegramService.sendMessage(chatId, welcomeMessage, {
    inlineKeyboard: [
      [{ text: "🔐 Login to CopperX", callback_data: CallbackEnum.LOGIN }],
      [{ text: "ℹ️ Help", callback_data: CallbackEnum.HELP }],
    ],
  });
}
