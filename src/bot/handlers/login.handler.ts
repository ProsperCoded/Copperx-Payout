import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { loginMessage } from "../messages/start.messages";
import { SessionService } from "../../utils/session/session.service";
import { UserState } from "../../types/session.types";

const sessionService = SessionService.getInstance();

export function loginHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  sessionService.updateSession(chatId, { state: UserState.AWAITING_EMAIL });
  TelegramService.sendMessage(chatId, loginMessage);
}

export async function handleEmailInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const email = msgObj.text?.trim();

  if (!email || !isValidEmail(email)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid email address."
    );
    return;
  }

  // Store email in session
  sessionService.updateSession(chatId, {
    email,
    state: UserState.AWAITING_OTP,
  });

  // TODO: Integrate with CopperX API to send OTP
  await TelegramService.sendMessage(
    chatId,
    "Great! We've sent an OTP to your email. Please enter it:"
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
