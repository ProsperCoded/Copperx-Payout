import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { AuthService } from "../../services/auth.service";
import { SessionService } from "../../utils/session/session.service";
import { logger } from "../webhook";

const authService = AuthService.getInstance();
const sessionService = SessionService.getInstance();

export async function handleCheckVerification(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(
      chatId,
      "⚠️ You need to be logged in to check your verification status.\n\nPlease use /login to authenticate first."
    );
    return;
  }

  await TelegramService.sendMessage(
    chatId,
    "🔍 Checking your verification status..."
  );

  try {
    // Get latest KYC status from API
    const kycStatus = await authService.checkKycStatus(chatId);
    const isVerified = kycStatus && kycStatus.status === "approved";

    // Update session with the latest KYC status
    await sessionService.updateSession(chatId, {
      kycVerified: isVerified,
    });

    if (isVerified) {
      // User is now verified
      await TelegramService.sendMessage(
        chatId,
        "✅ Great news! Your KYC verification is now complete.\n\nYou can now use all features of the CopperX Payout bot."
      );
    } else {
      // User is still not verified
      await TelegramService.sendMessage(
        chatId,
        "⚠️ Your KYC verification is still pending or incomplete.\n\nPlease complete your KYC verification to access all features.",
        {
          inlineKeyboard: [
            [
              {
                text: "Learn how to complete KYC",
                url: "https://copperx.io/blog/how-to-complete-your-kyc-and-kyb-at-copperx-payout",
              },
            ],
            [
              {
                text: "Complete KYC now",
                url: "https://copperx.io",
              },
            ],
          ],
        }
      );
    }
  } catch (error) {
    logger.error("Error checking verification status", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "😕 Sorry, we encountered an error checking your verification status. Please try again later."
    );
  }
}
