import { BotCommands } from "../../constants/bot-commands";

const availableCommands = BotCommands.map((cmd) => `/${cmd.command}`).join(
  ", "
);

export const UnknownCommandMessage = `
❓ Unknown command. Please use one of the following commands:
${availableCommands}
`;
