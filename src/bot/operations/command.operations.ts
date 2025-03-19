import { CommandsEnum } from "../../constants/bot-commands";
import { TelegramMessage } from "../../types/webhook.types";
import { handleStart } from "./../handlers/start.handler";

export const commandOperations: {
  [key in CommandsEnum]: (msgObj: TelegramMessage) => void;
} = {
  [CommandsEnum.START]: handleStart,
  [CommandsEnum.LOGIN]: (msgObj) => {},
  [CommandsEnum.WALLET]: (msgObj) => {},
  [CommandsEnum.SEND]: (msgObj) => {},
  [CommandsEnum.LOGOUT]: (msgObj) => {},
  [CommandsEnum.HELP]: (msgObj) => {},
};
