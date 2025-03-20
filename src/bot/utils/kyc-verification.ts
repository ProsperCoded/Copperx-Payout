import { TelegramService } from "../../utils/telegram/telegram.service";
import { AuthService } from "../../services/auth.service";

const authService = AuthService.getInstance();

/**
 * Checks if a user has completed KYC verification
 * If not, sends a message with KYC completion links
 *
 * @param chatId The chat ID to check verification for
 * @param featureName Optional name of the feature being restricted (for customized message)
 * @returns true if the user is verified, false otherwise
 */
export async function checkKycVerification(
  chatId: number,
  featureName: string = "this feature"
): Promise<boolean> {
  if (await authService.isKycVerified(chatId)) {
    return true;
  }

  await TelegramService.sendMessage(
    chatId,
    `⚠️ You need to complete KYC verification to access ${featureName}.`,
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

  return false;
}
