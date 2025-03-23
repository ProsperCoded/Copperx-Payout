import { CommandsEnum } from "../../constants/bot-commands";
import { TelegramMessage } from "../../types/webhook.types";
import { startHandler } from "./../handlers/start.handler";
import { loginHandler } from "../handlers/login.handler";
import { handleWalletCommand } from "../handlers/wallet.handler";
import { handleLogout } from "../handlers/logout.handler";
import {
  handleTransferCommand,
  handleSendCommand,
} from "../handlers/transfer.handler";
import { handleHelpCommand } from "../handlers/help.handler";

export const commandOperations: {
  [key in CommandsEnum]: (msgObj: TelegramMessage) => Promise<void> | void;
} = {
  [CommandsEnum.START]: startHandler,
  [CommandsEnum.LOGIN]: loginHandler,
  [CommandsEnum.WALLET]: handleWalletCommand,
  [CommandsEnum.TRANSFER]: handleTransferCommand,
  [CommandsEnum.SEND]: handleSendCommand,
  [CommandsEnum.LOGOUT]: handleLogout,
  [CommandsEnum.HELP]: handleHelpCommand,
};
