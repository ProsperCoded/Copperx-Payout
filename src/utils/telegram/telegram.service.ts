import axios from "axios";
import { configService } from "../config";
import { ENV } from "../../constants/env.enum";
import { TELEGRAM_API_URL } from "../../constants";

export type InlineKeyboardButton = {
  text: string;
  callback_data: string;
};

export type ReplyKeyboardButton = {
  text: string;
};

export class TelegramService {
  private static readonly botToken = configService.get(ENV.BOT_TOKEN);
  private static readonly apiUrl = `${TELEGRAM_API_URL}/bot${TelegramService.botToken}`;
  private static readonly apiTelegram = axios.create({
    baseURL: TelegramService.apiUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });
  static async sendMessage(
    chatId: number,
    text: string,
    options?: {
      inlineKeyboard?: InlineKeyboardButton[][];
      replyKeyboard?: ReplyKeyboardButton[][];
      oneTimeKeyboard?: boolean;
      removeKeyboard?: boolean;
    }
  ) {
    const replyMarkup: any = {};

    if (options?.inlineKeyboard) {
      replyMarkup.inline_keyboard = options.inlineKeyboard;
    }

    if (options?.replyKeyboard) {
      replyMarkup.keyboard = options.replyKeyboard;
      replyMarkup.resize_keyboard = true;
      replyMarkup.one_time_keyboard = options.oneTimeKeyboard ?? false;
    }

    if (options?.removeKeyboard) {
      replyMarkup.remove_keyboard = true;
    }

    try {
      await this.apiTelegram.post(`/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: Object.keys(replyMarkup).length ? replyMarkup : undefined,
      });
    } catch (error) {
      console.error("Error sending telegram message:", error);
      throw error;
    }
  }
}
