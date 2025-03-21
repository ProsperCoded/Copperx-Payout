import { CommandsEnum } from "../../constants/bot-commands";
import { CallbackEnum } from "../../constants/callback.enum";
import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { welcomeMessage } from "../messages/start.messages";
import { AuthService } from "../../services/auth.service";
import { SessionService } from "../../utils/session/session.service";

const authService = AuthService.getInstance();
const sessionService = SessionService.getInstance();

export async function startHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Check if user is authenticated
  const isAuthenticated = await authService.isAuthenticated(chatId);

  if (!isAuthenticated) {
    // New user or not logged in, show standard welcome message
    await TelegramService.sendMessage(chatId, welcomeMessage, {
      inlineKeyboard: [
        [{ text: "🔐 Login to CopperX", callback_data: CallbackEnum.LOGIN }],
        [{ text: "ℹ️ Help", callback_data: CallbackEnum.HELP }],
      ],
    });
    return;
  }

  // User is authenticated, get session to check KYC status
  const session = await sessionService.getSession(chatId);
  const firstName = session.email ? session.email.split("@")[0] : "there";

  if (session.kycVerified) {
    // User is verified, show friendly welcome back message
    await TelegramService.sendMessage(
      chatId,
      `👋 Welcome back, ${firstName}!\n\nYour account is fully verified. You can use all features of the CopperX Payout bot.`,
      {
        inlineKeyboard: [
          [
            {
              text: "💰 Check Wallet",
              callback_data: CallbackEnum.WALLET_BACK,
            },
          ],
          [{ text: "ℹ️ Help", callback_data: CallbackEnum.HELP }],
        ],
      }
    );
  } else {
    // User is authenticated but not verified
    await TelegramService.sendMessage(
      chatId,
      `👋 Welcome back, ${firstName}!\n\n⚠️ Your account KYC is not verified. You need to complete verification to use all features.`,
      {
        inlineKeyboard: [
          [
            {
              text: "🔍 Check Verification Status",
              callback_data: CallbackEnum.CHECK_VERIFICATION,
            },
          ],
          [
            {
              text: "Learn how to complete KYC",
              url: "https://copperx.io/blog/how-to-complete-your-kyc-and-kyb-at-copperx-payout",
            },
          ],
          [{ text: "Complete KYC now", url: "https://copperx.io" }],
        ],
      }
    );
  }
}
