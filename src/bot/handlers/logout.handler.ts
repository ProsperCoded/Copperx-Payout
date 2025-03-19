import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { AuthService } from "../../services/auth.service";

const authService = AuthService.getInstance();

export async function handleLogout(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  
  if (!authService.isAuthenticated(chatId)) {
    await TelegramService.sendMessage(
      chatId, 
      "You're not currently logged in."
    );
    return;
  }
  
  authService.logout(chatId);
  
  await TelegramService.sendMessage(
    chatId, 
    "You have been logged out successfully."
  );
}
