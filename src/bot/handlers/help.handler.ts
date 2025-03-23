import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { helpMessage } from "../messages/help.messages";
import { logger } from "../webhook";

export async function handleHelpCommand(
  msgObj: TelegramMessage
): Promise<void> {
  const chatId = msgObj.chat.id;

  try {
    await TelegramService.sendMessage(chatId, helpMessage);

    await TelegramService.sendMessage(
      chatId,
      "You can also access these resources directly:",
      {
        inlineKeyboard: [
          [
            { text: "🌐 Visit Website", url: "https://copperx.io/" },
            { text: "🤝 Support", url: "https://copperx.io/contact" },
          ],
          [
            {
              text: "📝 Terms & Conditions",
              url: "https://copperx.io/terms-of-service",
            },
          ],
        ],
      }
    );
  } catch (error) {
    logger.error("Error sending help message", {
      error: error.message,
      chatId,
    });
  }
}
