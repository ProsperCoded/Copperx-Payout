import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { loginMessage } from "../messages/start.messages";
import { SessionService } from "../../utils/session/session.service";
import { UserState } from "../../types/session.types";
import { AuthService } from "../../services/auth.service";
import { logger } from "../webhook";
const sessionService = SessionService.getInstance();
const authService = AuthService.getInstance();

export async function loginHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_EMAIL,
  });
  await TelegramService.sendMessage(chatId, loginMessage);
}

export async function handleEmailInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const email = msgObj.text?.trim();
  const session = await sessionService.getSession(chatId);

  // Check if user is already in OTP input state
  if (session.state === UserState.AWAITING_OTP) {
    await handleOtpInput(msgObj);
    return;
  }

  if (!email || !isValidEmail(email)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid email address."
    );
    return;
  }

  // Initiate login process
  await authService.initiateLogin(chatId, email);
}

export async function handleOtpInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const otp = msgObj.text?.trim();

  if (!otp || !isValidOtp(otp)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid OTP (usually a 6-digit number)."
    );
    return;
  }

  const user = await authService.verifyOtp(chatId, otp);

  if (user) {
    logger.debug("User Profile", user);

    // Check KYC status before proceeding
    const kycStatus = await authService.checkKycStatus(chatId);

    if (kycStatus && kycStatus.status === "verified") {
      // KYC verified - proceed normally
      await TelegramService.sendMessage(
        chatId,
        `✅ Login successful! Welcome, ${
          user.firstName || user.email
        }!\n\nYou can now use the following commands:\n• /wallet - Check your wallet balance\n• /send - Send funds to another user\n• /logout - Logout from your account`
      );
    } else {
      // KYC not verified - prompt user to complete KYC with URL buttons
      await TelegramService.sendMessage(
        chatId,
        `✅ Login successful! Welcome, ${
          user.firstName || user.email
        }!\n\n⚠️ Your account KYC is not verified. Please complete your KYC verification to use all features.`,
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
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidOtp(otp: string): boolean {
  return /^\d{4,6}$/.test(otp);
}
