import { CommandsEnum } from "../constants/bot-commands";
import { TelegramMessage } from "../types/webhook.types";

export const commandOperations: {
  [key in CommandsEnum]: (msg: TelegramMessage) => void;
} = {
  [CommandsEnum.START]: (msg) => {},
  [CommandsEnum.LOGIN]: (msg) => {},
  [CommandsEnum.WALLET]: (msg) => {},
  [CommandsEnum.SEND]: (msg) => {},
  [CommandsEnum.LOGOUT]: (msg) => {},
  [CommandsEnum.HELP]: (msg) => {},
};
