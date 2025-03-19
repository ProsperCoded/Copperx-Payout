import { CallbackEnum } from "../../constants/callback.enum";
import { TelegramMessage } from "../../types/webhook.types";
import { loginHandler } from "../handlers/login.handler";

export const callbackOperations: {
  [key in CallbackEnum]: (msgObj: TelegramMessage) => void;
} = {
  [CallbackEnum.LOGIN]: loginHandler,
  [CallbackEnum.HELP]: (msgObj: TelegramMessage) => {},
};
