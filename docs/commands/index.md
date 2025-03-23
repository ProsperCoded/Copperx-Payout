# Command Reference

This section provides a comprehensive reference for all commands available in the CopperX Payout Bot.

## Available Commands

| Command     | Description                           | Authentication Required | KYC Required |
| ----------- | ------------------------------------- | ----------------------- | ------------ |
| `/start`    | Start the bot and see welcome message | No                      | No           |
| `/login`    | Log in to your CopperX account        | No                      | No           |
| `/wallet`   | Manage your cryptocurrency wallet     | Yes                     | Yes          |
| `/transfer` | Access all transfer-related features  | Yes                     | Yes          |
| `/send`     | Quick command to send funds           | Yes                     | Yes          |
| `/logout`   | Log out from your CopperX account     | Yes                     | No           |
| `/help`     | Show help message with all commands   | No                      | No           |

## Command Details

Each command has its own detailed documentation:

- [/start](./start.md) - Initialize the bot and view welcome message
- [/login](./login.md) - Authenticate with your CopperX account
- [/wallet](./wallet.md) - Manage your cryptocurrency wallets
- [/transfer](./transfer.md) - View and manage your transfers
- [/send](./send.md) - Send funds to users (alias for transfer send)
- [/logout](./logout.md) - End your current session
- [/help](./help.md) - Get comprehensive help with the bot

## Command Implementation

Commands are implemented in the `src/bot/operations/command.operations.ts` file, which maps command names to their handler functions:

```typescript
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
```

When a user sends a command, the webhook handler extracts the command name and calls the appropriate handler function.

## Command Flow

Most commands follow this general flow:

1. **Authentication Check**: Verify if the user is authenticated (if required)
2. **KYC Verification**: Check if the user has completed KYC (if required)
3. **Command Processing**: Execute the command-specific logic
4. **Response Generation**: Send a response to the user, often with inline keyboards
5. **State Management**: Update the user's session state if necessary

## Adding New Commands

To add a new command to the bot:

1. Add the command to the `CommandsEnum` in `src/constants/bot-commands.ts`
2. Create a handler function in the appropriate file under `src/bot/handlers/`
3. Add the command to `commandOperations` in `src/bot/operations/command.operations.ts`
4. Add the command to `BotCommands` array in `src/constants/bot-commands.ts` to make it available in the Telegram menu
5. Run `npm run setup` to update the commands with Telegram

For more details on specific commands, click on the links in the Command Details section above.
