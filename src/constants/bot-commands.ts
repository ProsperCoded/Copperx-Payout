enum CommandsEnum {
  START = "start",
  LOGIN = "login",
  WALLET = "wallet",
  SEND = "send",
  LOGOUT = "logout",
  HELP = "help",
}
export { CommandsEnum };

export const BotCommands: Array<{
  command: CommandsEnum;
  description: string;
}> = [
  {
    command: CommandsEnum.START,
    description: "Start bot, display all options available",
  },
  { command: CommandsEnum.LOGIN, description: "Login to your Copperx Account" },
  {
    command: CommandsEnum.WALLET,
    description: "Manage your wallet (view balance)",
  },
  {
    command: CommandsEnum.SEND,
    description: "Manage your wallet (send funds)",
  },
  {
    command: CommandsEnum.LOGOUT,
    description: "Logout from your Copperx Account",
  },
  { command: CommandsEnum.HELP, description: "Get help with the bot commands" },
];
