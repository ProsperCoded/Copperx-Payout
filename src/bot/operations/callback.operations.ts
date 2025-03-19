import { CallbackEnum } from "../../constants/callback.enum";
import { TelegramMessage } from "../../types/webhook.types";

export const callbackOperations: {
  [key in CallbackEnum]: (msgObj: TelegramMessage) => void;
} = {
  [CallbackEnum.LOGIN]: (msgObj: TelegramMessage) => {},
  [CallbackEnum.HELP]: (msgObj: TelegramMessage) => {},
};
